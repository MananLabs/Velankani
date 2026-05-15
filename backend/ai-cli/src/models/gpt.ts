import { config } from '../config/env.js';
import { generateStreamingResponse } from './openrouter.js';

export type GPTResponse = any;

export async function generateGPTResponse(
  prompt: string,
  systemPrompt?: string
): Promise<GPTResponse> {
  return generateStreamingResponse({
    apiKey: config.openrouter.apiKeys.gpt,
    model: 'openai/gpt-oss-120b:free',
    prompt,
    systemPrompt,
  });
}
