/**
 * RAG — PDF Parser
 * Uses pdf-parse to extract text from PDF buffers.
 */

import { createRequire } from 'node:module';
import { LoadedFile } from '../loaders/file-loader.js';
import { BaseParser } from './base-parser.js';

// pdf-parse is CJS — load via createRequire in ESM context
const require = createRequire(import.meta.url);

export class PdfParser implements BaseParser {
  async parse(file: LoadedFile): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(file.buffer);
      const text = (result.text as string).trim();

      if (!text) {
        throw new Error('PDF contains no extractable text (may be image-only)');
      }

      return text;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`PDF parsing failed: ${msg}`);
    }
  }
}
