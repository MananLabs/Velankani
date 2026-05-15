/**
 * Image Pipeline — OCR Engine (Tesseract.js)
 *
 * Runs entirely locally — no cloud API calls.
 * Uses Tesseract.js v4+ with the English language pack.
 *
 * The worker is created once per call and terminated immediately after
 * to avoid memory leaks in a long-running CLI process.
 */

import { createWorker } from 'tesseract.js';
import { OCRResult } from '../types/index.js';
import { Logger } from '../../utils/logger.js';

export class TesseractOCR {
  /**
   * Extract text from a preprocessed image buffer.
   *
   * @param imageBuffer  PNG buffer (output of ImagePreprocessor.prepareForOCR)
   */
  static async extract(imageBuffer: Buffer): Promise<OCRResult> {
    let worker;

    try {
      // Create a fresh worker for each extraction
      worker = await createWorker('eng', 1, {
        // Suppress Tesseract's own verbose logging
        logger: () => {},
        errorHandler: () => {},
      });

      const { data } = await worker.recognize(imageBuffer);

      const text = data.text.trim();
      // Tesseract confidence is 0–100; normalise to 0–1
      const confidence = (data.confidence ?? 0) / 100;

      return {
        text,
        confidence,
        hasText: text.length > 0,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Logger.warn(`OCR extraction warning: ${msg}`);
      // Non-fatal — image may simply contain no text
      return { text: '', confidence: 0, hasText: false };
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }
}
