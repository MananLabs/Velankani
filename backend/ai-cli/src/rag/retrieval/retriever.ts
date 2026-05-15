/**
 * RAG — Semantic Retriever
 *
 * Given a query string and a documentId, converts the query to an embedding,
 * computes cosine similarity against all stored vectors, and returns the
 * top-k most relevant chunks.
 */

import { EmbeddingProvider, RetrievalConfig, RetrievalResult, TextChunk } from '../types/index.js';
import { LocalVectorStore } from '../vector-store/local-vector-store.js';
import { cosineSimilarity } from '../utils/cosine.js';
import { Logger } from '../../utils/logger.js';

const DEFAULT_CONFIG: RetrievalConfig = {
  topK: 5,
  minScore: 0.0,
};

export class Retriever {
  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly config: RetrievalConfig = DEFAULT_CONFIG
  ) {}

  /**
   * Retrieve the top-k most relevant chunks for a query from a specific document.
   */
  async retrieve(
    query: string,
    documentId: string
  ): Promise<RetrievalResult[]> {
    Logger.info('Retrieving relevant context...');

    // 1. Embed the query
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);

    // 2. Load stored vectors
    const entries = await LocalVectorStore.loadVectors(documentId);

    if (entries.length === 0) {
      Logger.warn(`No vectors found for document: ${documentId}`);
      return [];
    }

    // 3. Score all entries
    const scored = entries.map((entry) => ({
      chunk: {
        text: entry.text,
        metadata: entry.metadata,
      } as TextChunk,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    // 4. Filter by minScore, sort descending, take topK
    const results = scored
      .filter((r) => r.score >= this.config.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.topK);

    Logger.info(`Retrieved ${results.length} relevant chunks (topK=${this.config.topK})`);

    return results;
  }
}
