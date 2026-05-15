/**
 * RAG — OpenRouter Embedding Provider
 *
 * Uses the OpenRouter API to generate text embeddings via
 * text-embedding-3-small (OpenAI model routed through OpenRouter).
 *
 * Endpoint: POST https://openrouter.ai/api/v1/embeddings
 * Docs: https://openrouter.ai/docs/embeddings
 */

import { EmbeddingProvider } from '../types/index.js';
import { Logger } from '../../utils/logger.js';

const EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';

export class OpenRouterEmbeddingProvider implements EmbeddingProvider {
  readonly providerName = 'OpenRouter (text-embedding-3-small)';

  constructor(private readonly apiKey: string) {
    if (!apiKey) throw new Error('OpenRouter API key is required for embeddings');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Embedding API error ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as {
        data: Array<{ embedding: number[] }>;
      };

      const embedding = data?.data?.[0]?.embedding;

      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Invalid embedding response: empty or malformed vector');
      }

      return embedding;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate embedding: ${msg}`);
    }
  }
}
