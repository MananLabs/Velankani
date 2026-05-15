/**
 * Microphone Recording Module
 * Records audio using ffmpeg (bundled via ffmpeg-static) — no sox required.
 */

import { spawn, ChildProcess } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { createRequire } from 'node:module';
import { Logger } from '../utils/logger.js';
import { RecordingResult, VoiceRecorderConfig } from './types.js';

// ffmpeg-static is CJS — use createRequire to load it in ESM context
const require = createRequire(import.meta.url);
const ffmpegPath: string = require('ffmpeg-static');

const RECORDINGS_DIR = path.join(process.cwd(), '.recordings');

export class VoiceRecorder {
  private static recordingProcess: ChildProcess | null = null;
  private static currentFilePath: string = '';
  private static recordingStartTime: number = 0;

  /**
   * Initialize recordings directory
   */
  static async initialize(): Promise<void> {
    try {
      await fs.ensureDir(RECORDINGS_DIR);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to initialize recordings directory: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Start recording from microphone using ffmpeg
   */
  static async startRecording(config?: VoiceRecorderConfig): Promise<void> {
    try {
      Logger.info('🎤 Initializing microphone...');

      // Stop any existing recording
      if (this.recordingProcess) {
        this.recordingProcess.kill();
        this.recordingProcess = null;
      }

      const fileName = `recording-${Date.now()}.wav`;
      const filePath = path.join(RECORDINGS_DIR, fileName);
      this.currentFilePath = filePath;

      const sampleRate = config?.sampleRate || 16000;
      const channels = config?.channels || 1;

      // Detect the default audio device name on Windows
      const deviceName = await this.getDefaultAudioDevice();

      // ffmpeg args: read from dshow microphone, write PCM WAV to file
      const args = [
        '-y',                          // overwrite output if exists
        '-f', 'dshow',                 // DirectShow input (Windows)
        '-i', `audio=${deviceName}`,   // microphone device
        '-ar', String(sampleRate),     // sample rate
        '-ac', String(channels),       // channels
        '-acodec', 'pcm_s16le',        // PCM 16-bit little-endian
        '-f', 'wav',                   // force WAV container
        filePath,                      // output file
      ];

      this.recordingProcess = spawn(ffmpegPath, args, {
        stdio: ['pipe', 'ignore', 'pipe'],  // pipe stdin so we can send 'q' to stop gracefully
      });

      this.recordingStartTime = Date.now();

      this.recordingProcess.stderr?.on('data', (data: Buffer) => {
        // ffmpeg writes progress to stderr — suppress unless debug needed
        const msg = data.toString();
        if (msg.includes('Error') || msg.includes('error')) {
          Logger.error(`ffmpeg: ${msg.trim()}`);
        }
      });

      this.recordingProcess.on('error', (err) => {
        Logger.error(`Recording process error: ${err.message}`);
      });

      Logger.info('🎙️  Listening... Press ENTER to stop recording');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to start recording: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * List all available Windows audio input devices via ffmpeg dshow
   */
  static async listAudioDevices(): Promise<string[]> {
    return new Promise((resolve) => {
      const probe = spawn(ffmpegPath, ['-list_devices', 'true', '-f', 'dshow', '-i', 'dummy'], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });

      let output = '';
      probe.stderr?.on('data', (d: Buffer) => { output += d.toString(); });

      probe.on('close', () => {
        const devices: string[] = [];
        const lines = output.split('\n');
        let inAudioSection = false;

        for (const line of lines) {
          // Detect transition into the audio devices section
          if (line.includes('DirectShow audio devices')) {
            inAudioSection = true;
            continue;
          }
          // Stop if we hit a non-audio section after audio section started
          if (inAudioSection && line.includes('DirectShow video devices')) {
            break;
          }
          if (inAudioSection) {
            const match = line.match(/"([^"]+)"\s+\(audio\)/);
            if (match) {
              devices.push(match[1]);
            }
          }
        }

        // Fallback: collect all audio-tagged lines if section parsing found nothing
        if (devices.length === 0) {
          for (const line of lines) {
            const match = line.match(/"([^"]+)"\s+\(audio\)/);
            if (match) devices.push(match[1]);
          }
        }

        resolve(devices);
      });
    });
  }

  /**
   * Detect the best audio input device on Windows.
   * Prefers Bluetooth / headset / earphone devices over built-in mics.
   * Override with PREFERRED_MIC env var (partial name match).
   */
  private static async getDefaultAudioDevice(): Promise<string> {
    const devices = await this.listAudioDevices();

    if (devices.length === 0) {
      Logger.warn('Could not detect any audio device, using fallback name');
      return 'Microphone';
    }

    // Allow explicit override via environment variable (partial name match)
    const envMic = process.env.PREFERRED_MIC;
    if (envMic) {
      const match = devices.find((d) => d.toLowerCase().includes(envMic.toLowerCase()));
      if (match) {
        Logger.info(`Using PREFERRED_MIC override: ${match}`);
        return match;
      }
      Logger.warn(`PREFERRED_MIC="${envMic}" not found in device list, ignoring`);
    }

    // Keywords that indicate a Bluetooth or headset microphone (case-insensitive)
    const bluetoothKeywords = [
      'bluetooth', 'headset', 'headphone', 'earphone', 'earbuds',
      'hands-free', 'handsfree', 'wireless', 'airpods', 'buds',
    ];

    const preferred = devices.find((d) =>
      bluetoothKeywords.some((kw) => d.toLowerCase().includes(kw))
    );

    const chosen = preferred ?? devices[0];
    Logger.info(`Using audio device: ${chosen}`);

    if (preferred) {
      Logger.info(`(Bluetooth/headset device auto-selected)`);
    } else if (devices.length > 1) {
      Logger.info(`Available devices: ${devices.join(' | ')}`);
      Logger.info(`Tip: set PREFERRED_MIC in .env to pick a specific device`);
    }

    return chosen;
  }

  /**
   * Stop recording and return file path
   */
  static async stopRecording(): Promise<RecordingResult> {
    try {
      if (!this.recordingProcess) {
        return {
          success: false,
          audioPath: '',
          duration: 0,
          error: 'No active recording found',
        };
      }

      const duration = Date.now() - this.recordingStartTime;

      if (duration < 500) {
        Logger.warn('⚠️  Recording too short (< 500ms)');
        this.recordingProcess.kill();
        this.recordingProcess = null;
        return {
          success: false,
          audioPath: '',
          duration,
          error: 'Recording too short',
        };
      }

      // Send 'q' to ffmpeg stdin — this triggers a graceful shutdown
      // which properly writes the WAV header and flushes all audio data
      this.recordingProcess.stdin?.write('q');
      this.recordingProcess.stdin?.end();

      // Wait for ffmpeg to finish writing the file
      await new Promise<void>((resolve) => {
        this.recordingProcess!.on('close', () => resolve());
        // Safety timeout in case close never fires
        setTimeout(resolve, 3000);
      });

      this.recordingProcess = null;

      const audioPath = this.currentFilePath;

      if (!audioPath || !(await fs.pathExists(audioPath))) {
        return {
          success: false,
          audioPath: '',
          duration,
          error: 'Recording file not found after stopping',
        };
      }

      Logger.success(`✓ Recording complete (${Math.round(duration / 1000)}s)`);

      return {
        success: true,
        audioPath,
        duration,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to stop recording: ${errorMsg}`);
      return {
        success: false,
        audioPath: '',
        duration: 0,
        error: errorMsg,
      };
    }
  }

  /**
   * Delete recording file
   */
  static async deleteRecording(filePath: string): Promise<boolean> {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        return true;
      }
      return false;
    } catch (error) {
      Logger.warn(`Failed to delete recording: ${error}`);
      return false;
    }
  }

  /**
   * Clean up all recordings in temp directory
   */
  static async cleanup(): Promise<void> {
    try {
      if (this.recordingProcess) {
        this.recordingProcess.stdin?.write('q');
        this.recordingProcess.stdin?.end();
        this.recordingProcess = null;
      }
      if (await fs.pathExists(RECORDINGS_DIR)) {
        await fs.remove(RECORDINGS_DIR);
        Logger.info('Cleaned up recording files');
      }
    } catch (error) {
      Logger.warn(`Failed to cleanup recordings: ${error}`);
    }
  }
}
