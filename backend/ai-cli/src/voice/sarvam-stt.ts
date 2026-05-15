/**
 * Sarvam AI Speech-to-Text (STT) Integration
 * POST https://api.sarvam.ai/speech-to-text
 * Expects multipart/form-data with the audio file + model + language_code
 */

import { stat, readFile, access } from 'node:fs/promises';
import * as path from 'path';
import { Logger } from '../utils/logger.js';
import { SarvamSTTResponse } from './types.js';

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

export class SarvamSTT {
  private static apiKey: string;

  static initialize(apiKey: string): void {
    if (!apiKey) throw new Error('Sarvam API key is not configured');
    this.apiKey = apiKey;
  }

  /**
   * Transcribe audio file using Sarvam AI (multipart/form-data upload)
   */
  static async transcribe(audioPath: string): Promise<SarvamSTTResponse> {
    try {
      Logger.info('📝 Transcribing with Sarvam AI...');

      // Verify file exists
      try {
        await access(audioPath);
      } catch {
        return { transcript: '', error: 'Audio file not found' };
      }

      const audioBuffer = await readFile(audioPath);
      const fileName = path.basename(audioPath);

      // Build multipart/form-data manually using FormData (Node 18+ built-in)
      const formData = new FormData();
      formData.append(
        'file',
        new Blob([audioBuffer], { type: 'audio/wav' }),
        fileName,
      );
      formData.append('model', 'saarika:v2.5');
      formData.append('language_code', 'en-IN');

      const response = await fetch(SARVAM_STT_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey,
          // Do NOT set Content-Type — fetch sets it automatically with the boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const msg = `Sarvam API error ${response.status}: ${errorText}`;
        Logger.error(msg);
        return { transcript: '', error: msg };
      }

      const data = (await response.json()) as Record<string, unknown>;
      const transcript = String(data.transcript || '').trim();

      if (!transcript) {
        return { transcript: '', error: 'No speech detected in audio' };
      }

      Logger.success('✓ Transcription complete');
      return { transcript };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Logger.error(`Transcription failed: ${msg}`);
      return { transcript: '', error: msg };
    }
  }

  /**
   * Validate audio file size before uploading
   */
  static async validateAudio(audioPath: string): Promise<boolean> {
    try {
      const stats = await stat(audioPath);
      const minSize = 1000;          // 1 KB minimum
      const maxSize = 25 * 1024 * 1024; // 25 MB maximum

      if (stats.size < minSize) {
        Logger.warn(`Audio file too small (${stats.size} bytes)`);
        return false;
      }
      if (stats.size > maxSize) {
        Logger.warn(`Audio file too large (${stats.size} bytes)`);
        return false;
      }
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to validate audio: ${msg}`);
      return false;
    }
  }
}
