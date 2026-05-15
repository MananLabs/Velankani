/**
 * RAG — CSV Parser
 * Converts CSV rows into a readable text representation.
 * Uses csv-parse for robust RFC 4180 compliance.
 */

import { parse } from 'csv-parse/sync';
import { LoadedFile } from '../loaders/file-loader.js';
import { BaseParser } from './base-parser.js';

export class CsvParser implements BaseParser {
  async parse(file: LoadedFile): Promise<string> {
    try {
      const raw = file.buffer.toString('utf-8');

      const records = parse(raw, {
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
      }) as string[][];

      if (records.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Convert to a human-readable format: "Header1: value1 | Header2: value2"
      const [headers, ...rows] = records;

      const lines = rows.map((row) =>
        headers
          .map((h, i) => `${h}: ${row[i] ?? ''}`)
          .join(' | ')
      );

      return [`Headers: ${headers.join(', ')}`, ...lines].join('\n');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`CSV parsing failed: ${msg}`);
    }
  }
}
