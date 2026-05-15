import { config } from '../config/env.js';
import { generateStreamingResponse } from './openrouter.js';

export type ClaudeResponse = any;

export async function generateClaudeResponse(
  prompt: string,
  systemPrompt?: string
): Promise<ClaudeResponse> {
  return generateStreamingResponse({
    apiKey: config.openrouter.apiKeys.claude,
    model: 'anthropic/claude-3.5-haiku',
    prompt,
    systemPrompt,
  });
}
