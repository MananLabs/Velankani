/**
 * RAG — Base Parser Interface
 * All format-specific parsers implement this contract.
 */

import { LoadedFile } from '../loaders/file-loader.js';

export interface BaseParser {
  /**
   * Extract plain text from the loaded file buffer.
   * Must handle malformed / corrupted input gracefully.
   */
  parse(file: LoadedFile): Promise<string>;
}
