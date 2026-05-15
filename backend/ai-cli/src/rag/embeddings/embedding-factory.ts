/**
 * RAG — Embedding Factory
 *
 * Selects and instantiates the correct EmbeddingProvider based on
 * available environment configuration.
 *
 * Priority:
 *   1. OPENROUTER_API_KEY_GPT (already required by the app)
 *   2. OPENROUTER_API_KEY (fallback single key)
 *
 * Future providers (Gemini native, local model, etc.) can be added here
 * without touching any other module.
 */

import { EmbeddingProvider } from '../types/index.js';
import { OpenRouterEmbeddingProvider } from './openrouter-embedding.js';
import { Logger } from '../../utils/logger.js';

export function createEmbeddingProvider(): EmbeddingProvider {
  const apiKey =
    process.env.OPENROUTER_API_KEY_GPT ||
    process.env.OPENROUTER_API_KEY ||
    '';

  if (!apiKey) {
    throw new Error(
      'No API key available for embeddings. ' +
      'Set OPENROUTER_API_KEY_GPT or OPENROUTER_API_KEY in .env'
    );
  }

  const provider = new OpenRouterEmbeddingProvider(apiKey);
  Logger.info(`Embedding provider: ${provider.providerName}`);
  return provider;
}
