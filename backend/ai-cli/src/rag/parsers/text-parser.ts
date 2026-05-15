/**
 * RAG — Plain Text Parser
 * Handles: .txt, .md, .json, .html, .xml, .code files
 *
 * For HTML/XML we strip tags to get clean text.
 * For JSON we pretty-print to preserve structure readability.
 * For everything else we return the raw UTF-8 content.
 */

import { LoadedFile } from '../loaders/file-loader.js';
import { BaseParser } from './base-parser.js';

export class TextParser implements BaseParser {
  async parse(file: LoadedFile): Promise<string> {
    try {
      const raw = file.buffer.toString('utf-8');

      if (!raw.trim()) {
        throw new Error('File contains no text content');
      }

      switch (file.fileType) {
        case 'html':
        case 'xml':
          return this.stripTags(raw);

        case 'json':
          return this.formatJson(raw);

        default:
          // txt, md, code — return as-is
          return raw;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Text parsing failed: ${msg}`);
    }
  }

  /**
   * Strip HTML/XML tags and decode common entities.
   */
  private stripTags(html: string): string {
    return html
      // Remove script and style blocks entirely
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      // Remove all remaining tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Collapse whitespace
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Pretty-print JSON so the chunker can split it meaningfully.
   */
  private formatJson(raw: string): string {
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Not valid JSON — return raw text anyway
      return raw;
    }
  }
}
