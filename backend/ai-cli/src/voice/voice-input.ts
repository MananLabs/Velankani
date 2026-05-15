/**
 * Voice Input Orchestrator
 * Coordinates the complete voice recording and transcription flow
 */

import { Logger } from '../utils/logger.js';
import { Terminal } from '../utils/terminal.js';
import { VoiceRecorder } from './recorder.js';
import { SarvamSTT } from './sarvam-stt.js';
import { InputMode, InputModeSelection, VoiceInputOptions } from './types.js';

export class VoiceInputOrchestrator {
  /**
   * Display input mode selection menu
   */
  static async selectInputMode(): Promise<InputModeSelection> {
    return new Promise((resolve) => {
      console.log('\n' + '═'.repeat(50));
      console.log('  SELECT INPUT MODE');
      console.log('═'.repeat(50));
      console.log('  1. Via Text');
      console.log('  2. Via Voice');
      console.log('  3. Via Document');
      console.log('  4. Via Image');
      console.log('  5. Via Web Search');
      console.log('═'.repeat(50));

      Terminal.rl.question('\n  Enter Option (1-5): ', (answer) => {
        if (answer === '1') {
          resolve({ mode: 'text' });
        } else if (answer === '2') {
          resolve({ mode: 'voice' });
        } else if (answer === '3') {
          resolve({ mode: 'document' });
        } else if (answer === '4') {
          resolve({ mode: 'image' });
        } else if (answer === '5') {
          resolve({ mode: 'web-search' });
        } else {
          Logger.warn('Invalid option. Defaulting to text mode.');
          resolve({ mode: 'text' });
        }
      });
    });
  }

  /**
   * Get prompt from user via voice input
   */
  static async getVoiceInput(options?: VoiceInputOptions): Promise<string> {
    try {
      // Initialize recorder
      await VoiceRecorder.initialize();

      return new Promise(async (resolve) => {
        // Start recording
        await VoiceRecorder.startRecording();

        // Wait for user to press ENTER using the shared rl instance
        Terminal.rl.once('line', async () => {
          // Stop recording
          const recordingResult = await VoiceRecorder.stopRecording();

          if (!recordingResult.success) {
            Logger.error(
              `Recording failed: ${recordingResult.error || 'Unknown error'}`
            );
            resolve('');
            return;
          }

          try {
            // Validate audio
            const isValid = await SarvamSTT.validateAudio(
              recordingResult.audioPath
            );
            if (!isValid) {
              Logger.error('Invalid or corrupted audio file');
              await VoiceRecorder.deleteRecording(recordingResult.audioPath);
              resolve('');
              return;
            }

            // Transcribe audio
            const transcriptionResult = await SarvamSTT.transcribe(
              recordingResult.audioPath
            );

            // Clean up recording
            await VoiceRecorder.deleteRecording(recordingResult.audioPath);

            if (
              !transcriptionResult.transcript ||
              transcriptionResult.error
            ) {
              Logger.error(
                `Transcription failed: ${transcriptionResult.error || 'Unknown error'}`
              );
              resolve('');
              return;
            }

            console.log('\n' + '─'.repeat(50));
            Logger.success(
              `✓ Detected: "${transcriptionResult.transcript}"`
            );
            console.log('─'.repeat(50) + '\n');

            resolve(transcriptionResult.transcript);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            Logger.error(`Voice input processing failed: ${errorMsg}`);
            await VoiceRecorder.deleteRecording(recordingResult.audioPath);
            resolve('');
          }
        });

        // Set timeout for recording
        const timeout = options?.maxRecordingTime || 60000;
        setTimeout(async () => {
          Logger.warn(`Recording timeout (${timeout / 1000}s)`);
          const result = await VoiceRecorder.stopRecording();
          if (result.success) {
            const transcriptionResult = await SarvamSTT.transcribe(
              result.audioPath
            );
            await VoiceRecorder.deleteRecording(result.audioPath);
            resolve(transcriptionResult.transcript || '');
          } else {
            resolve('');
          }
        }, timeout);
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Voice input failed: ${errorMsg}`);
      await VoiceRecorder.cleanup();
      return '';
    }
  }

  /**
   * Get prompt from user via text input
   */
  static async getTextInput(): Promise<string> {
    return new Promise((resolve) => {
      Terminal.rl.question('\n  Enter Prompt: ', (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Unified prompt input handler
   */
  static async getPrompt(mode?: InputMode): Promise<string> {
    if (!mode) {
      const selection = await this.selectInputMode();
      mode = selection.mode;
    }

    if (mode === 'voice') {
      Logger.info('Voice mode selected');
      return await this.getVoiceInput();
    } else {
      Logger.info('Text mode selected');
      return await this.getTextInput();
    }
  }

  /**
   * Clean up resources
   */
  static async cleanup(): Promise<void> {
    await VoiceRecorder.cleanup();
  }
}
