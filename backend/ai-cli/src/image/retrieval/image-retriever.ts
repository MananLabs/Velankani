/**
 * Image Pipeline — Semantic Retriever
 *
 * Embeds the user query, computes cosine similarity against all stored
 * image vectors, and returns the top-k most relevant image contexts.
 *
 * Retrieval is always cross-image (searches all indexed images), unlike
 * the document RAG retriever which is scoped to a single document.
 */

import { EmbeddingProvider } from '../../rag/types/index.js';
import { ImageVectorStore } from '../vector-store/image-vector-store.js';
import { ImageRetrievalResult } from '../types/index.js';
import { cosineSimilarity } from '../../rag/utils/cosine.js';
import { Logger } from '../../utils/logger.js';

export interface ImageRetrievalConfig {
  topK: number;
  minScore: number;
}

const DEFAULT_CONFIG: ImageRetrievalConfig = {
  topK: 5,
  minScore: 0.0,
};

export class ImageRetriever {
  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly config: ImageRetrievalConfig = DEFAULT_CONFIG
  ) {}

  /**
   * Retrieve the top-k most relevant image contexts for a query.
   * Searches across ALL indexed images.
   */
  async retrieve(query: string, imageId?: string): Promise<ImageRetrievalResult[]> {
    Logger.info('Retrieving image context...');

    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);

    // Load vectors — scoped to one image if imageId provided, else all
    let entries;
    if (imageId) {
      const entry = await ImageVectorStore.loadVector(imageId);
      entries = entry ? [entry] : [];
    } else {
      entries = await ImageVectorStore.loadAllVectors();
    }

    if (entries.length === 0) {
      Logger.warn('No image vectors found for retrieval');
      return [];
    }

    const scored = entries.map((entry) => ({
      entry,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    const results = scored
      .filter((r) => r.score >= this.config.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.topK);

    Logger.info(`Retrieved ${results.length} relevant image context(s)`);
    return results;
  }
}
