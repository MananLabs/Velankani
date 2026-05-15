/**
 * RAG — Text Chunker
 *
 * Splits a document's text into overlapping chunks with full metadata.
 *
 * Strategy: sliding-window over character positions.
 * - Tries to break at paragraph boundaries (double newline) within the window.
 * - Falls back to sentence boundaries ('. ', '! ', '? ').
 * - Falls back to word boundaries (' ').
 * - Hard-cuts only as a last resort.
 *
 * This makes the chunker "semantic-boundary aware" without requiring an NLP
 * model, while remaining fully configurable and replaceable.
 */

import { TextChunk, ChunkingConfig, DocumentMetadata } from '../types/index.js';
import { generateId } from '../utils/hash.js';

const DEFAULT_CONFIG: ChunkingConfig = {
  chunkSize: 1000,
  overlap: 200,
};

export class TextChunker {
  private readonly config: ChunkingConfig;

  constructor(config?: Partial<ChunkingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.overlap >= this.config.chunkSize) {
      throw new Error('Overlap must be smaller than chunkSize');
    }
  }

  /**
   * Split text into overlapping chunks with metadata.
   */
  chunk(text: string, metadata: DocumentMetadata): TextChunk[] {
    const { chunkSize, overlap } = this.config;
    const chunks: TextChunk[] = [];

    // Normalise line endings
    const normalised = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    let start = 0;

    while (start < normalised.length) {
      const rawEnd = Math.min(start + chunkSize, normalised.length);

      // Find a natural break point near rawEnd (search backwards up to 20% of chunkSize)
      const end = rawEnd < normalised.length
        ? this.findBreakPoint(normalised, rawEnd, Math.floor(chunkSize * 0.2))
        : rawEnd;

      const chunkText = normalised.slice(start, end).trim();

      if (chunkText.length > 0) {
        const chunkIndex = chunks.length;
        chunks.push({
          text: chunkText,
          metadata: {
            id: generateId(metadata.documentId, String(chunkIndex), chunkText.slice(0, 32)),
            source: metadata.sourcePath,
            documentId: metadata.documentId,
            chunkIndex,
            createdAt: new Date().toISOString(),
            startOffset: start,
            endOffset: end,
          },
        });
      }

      // Advance by (chunkSize - overlap), but at least 1 to avoid infinite loop
      const advance = Math.max(chunkSize - overlap, 1);
      start += advance;

      // If we've passed the end of the text, stop
      if (start >= normalised.length) break;
    }

    return chunks;
  }

  /**
   * Search backwards from `pos` up to `maxLookback` characters for a
   * natural break point.  Priority: paragraph > sentence > word > hard cut.
   */
  private findBreakPoint(text: string, pos: number, maxLookback: number): number {
    const searchStart = Math.max(0, pos - maxLookback);
    const window = text.slice(searchStart, pos);

    // Paragraph boundary (double newline)
    const paraIdx = window.lastIndexOf('\n\n');
    if (paraIdx !== -1) return searchStart + paraIdx + 2;

    // Single newline
    const newlineIdx = window.lastIndexOf('\n');
    if (newlineIdx !== -1) return searchStart + newlineIdx + 1;

    // Sentence boundary
    for (const sep of ['. ', '! ', '? ', '; ']) {
      const idx = window.lastIndexOf(sep);
      if (idx !== -1) return searchStart + idx + sep.length;
    }

    // Word boundary
    const spaceIdx = window.lastIndexOf(' ');
    if (spaceIdx !== -1) return searchStart + spaceIdx + 1;

    // Hard cut — no natural boundary found
    return pos;
  }
}
