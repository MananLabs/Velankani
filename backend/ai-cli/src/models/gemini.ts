import { config } from '../config/env.js';
import { generateStreamingResponse } from './openrouter.js';

export type GeminiResponse = any;

export async function generateGeminiResponse(
  prompt: string,
  systemPrompt?: string
): Promise<GeminiResponse> {
  return generateStreamingResponse({
    apiKey: config.openrouter.apiKeys.gemini,
    model: 'google/gemini-3.1-flash-lite',
    prompt,
    systemPrompt,
  });
}
