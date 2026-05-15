/**
 * Image Pipeline — Embedding Factory
 *
 * Reuses the same OpenRouter embedding provider as the RAG pipeline.
 * Embeddings are generated from combined OCR text + vision caption —
 * NOT from raw image pixels.
 */

import { EmbeddingProvider } from '../../rag/types/index.js';
import { OpenRouterEmbeddingProvider } from '../../rag/embeddings/openrouter-embedding.js';
import { Logger } from '../../utils/logger.js';

export function createImageEmbeddingProvider(): EmbeddingProvider {
  const apiKey =
    process.env.OPENROUTER_API_KEY_GPT ||
    process.env.OPENROUTER_API_KEY ||
    '';

  if (!apiKey) {
    throw new Error(
      'No API key available for image embeddings. ' +
      'Set OPENROUTER_API_KEY_GPT or OPENROUTER_API_KEY in .env'
    );
  }

  const provider = new OpenRouterEmbeddingProvider(apiKey);
  Logger.info(`Image embedding provider: ${provider.providerName}`);
  return provider;
}

/**
 * Build the combined text that will be embedded for an image.
 * Combines OCR text and vision caption into a single semantic string.
 */
export function buildEmbeddingText(ocrText: string, caption: string): string {
  const parts: string[] = [];

  if (caption.trim()) {
    parts.push(`Image description: ${caption.trim()}`);
  }

  if (ocrText.trim()) {
    parts.push(`Extracted text: ${ocrText.trim()}`);
  }

  if (parts.length === 0) {
    return 'No content extracted from image.';
  }

  return parts.join('\n\n');
}
