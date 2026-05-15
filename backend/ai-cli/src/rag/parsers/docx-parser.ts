/**
 * RAG — DOCX Parser
 * Uses mammoth to extract plain text from .docx buffers.
 */

import mammoth from 'mammoth';
import { LoadedFile } from '../loaders/file-loader.js';
import { BaseParser } from './base-parser.js';

export class DocxParser implements BaseParser {
  async parse(file: LoadedFile): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });

      if (result.messages.length > 0) {
        // mammoth warnings — non-fatal, log them at debug level if needed
      }

      const text = result.value.trim();

      if (!text) {
        throw new Error('DOCX contains no extractable text');
      }

      return text;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`DOCX parsing failed: ${msg}`);
    }
  }
}
