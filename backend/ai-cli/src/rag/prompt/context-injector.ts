/**
 * RAG — Context Injector
 *
 * Takes retrieved chunks and a user query, and produces an augmented
 * prompt string that can be passed directly to the existing
 * AIOrchestrator.orchestrate() without any modification to that pipeline.
 *
 * The injector is the ONLY point of contact between the RAG system and
 * the existing AI orchestration layer.
 */

import { RetrievalResult } from '../types/index.js';

export class ContextInjector {
  /**
   * Build an augmented prompt from retrieved context chunks + user query.
   *
   * @param query       The user's original question
   * @param results     Top-k retrieval results (may be empty)
   * @param sourceName  Human-readable document name for the prompt header
   */
  static buildAugmentedPrompt(
    query: string,
    results: RetrievalResult[],
    sourceName: string
  ): string {
    if (results.length === 0) {
      // No relevant context found — pass the query through unchanged
      return query;
    }

    const contextBlocks = results
      .map((r, i) => {
        const score = (r.score * 100).toFixed(1);
        return `[Chunk ${i + 1} | relevance: ${score}%]\n${r.chunk.text}`;
      })
      .join('\n\n---\n\n');

    return [
      `You are answering a question about the document: "${sourceName}".`,
      ``,
      `Use ONLY the following extracted context to answer the question.`,
      `If the answer is not contained in the context, say so clearly.`,
      ``,
      `=== DOCUMENT CONTEXT ===`,
      contextBlocks,
      `=== END OF CONTEXT ===`,
      ``,
      `Question: ${query}`,
    ].join('\n');
  }
}
