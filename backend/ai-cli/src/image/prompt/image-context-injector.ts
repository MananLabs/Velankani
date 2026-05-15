/**
 * Image Pipeline — Context Injector
 *
 * Builds an augmented prompt string from retrieved image contexts.
 * This is the ONLY integration point between the image pipeline and
 * the existing AIOrchestrator — nothing else is modified.
 */

import { ImageRetrievalResult } from '../types/index.js';

export class ImageContextInjector {
  /**
   * Build an augmented prompt from image retrieval results + user query.
   *
   * @param query    The user's question
   * @param results  Top-k image retrieval results
   */
  static buildAugmentedPrompt(
    query: string,
    results: ImageRetrievalResult[]
  ): string {
    if (results.length === 0) {
      return query;
    }

    const contextBlocks = results.map((r, i) => {
      const score = (r.score * 100).toFixed(1);
      const lines: string[] = [
        `[Image ${i + 1}: ${r.entry.metadata.fileName} | relevance: ${score}%]`,
      ];

      if (r.entry.caption) {
        lines.push(`Image Description: ${r.entry.caption}`);
      }

      if (r.entry.ocrText) {
        lines.push(`Extracted Text:\n${r.entry.ocrText}`);
      }

      return lines.join('\n');
    }).join('\n\n---\n\n');

    return [
      'You are answering a question about one or more images.',
      '',
      'Use ONLY the following extracted image context to answer the question.',
      'If the answer is not contained in the context, say so clearly.',
      '',
      '=== IMAGE CONTEXT ===',
      contextBlocks,
      '=== END OF IMAGE CONTEXT ===',
      '',
      `Question: ${query}`,
    ].join('\n');
  }
}
