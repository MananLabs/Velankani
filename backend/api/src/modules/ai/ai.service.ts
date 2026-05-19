// ═══════════════════════════════════════════════════════════
// VEL AI — AI Service (OpenRouter via fetch)
// ═══════════════════════════════════════════════════════════

import { Injectable, Logger } from '@nestjs/common';

interface StreamOptions {
  model: string;
  messages: Array<{ role: string; content: string }>;
  user: { id: string; byokOpenaiKey?: string | null; byokAnthropicKey?: string | null };
  byokKey?: string | null;
  maxTokens?: number;
}

interface StreamChunk {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  private getApiKey(model: string): string {
    const openRouterId = this.resolveModelId(model);

    if (openRouterId.includes('claude') || openRouterId.includes('anthropic')) {
      return process.env.OPENROUTER_API_KEY_CLAUDE || process.env.OPENROUTER_API_KEY || '';
    }
    if (openRouterId.includes('gemini') || openRouterId.includes('google')) {
      return process.env.OPENROUTER_API_KEY_GEMINI || process.env.OPENROUTER_API_KEY || '';
    }
    // GPT and all others
    return process.env.OPENROUTER_API_KEY || '';
  }

  async *createStream(options: StreamOptions): AsyncGenerator<StreamChunk> {
    const { model, messages, maxTokens = 4096 } = options;

    const openRouterId = this.resolveModelId(model);
    const apiKey = options.byokKey || this.getApiKey(model);

    if (!apiKey) {
      throw new Error('No API key configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'VEL AI',
      },
      body: JSON.stringify({
        model: openRouterId,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`OpenRouter error: ${response.status} - ${errorText}`);
      throw new Error(`AI model error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body from AI provider');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data) as StreamChunk;
            yield parsed;
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private resolveModelId(modelId: string): string {
    if (modelId.includes('/')) return modelId;

    const modelMap: Record<string, string> = {
      // Anthropic
      'claude-opus-4': 'anthropic/claude-3-haiku',
      'claude-sonnet-4': 'anthropic/claude-3-haiku',
      'claude-haiku-3-5': 'anthropic/claude-3-haiku',
      // OpenAI
      'gpt-4o': 'openai/gpt-oss-120b:free',
      'gpt-4-1': 'openai/gpt-oss-120b:free',
      'o3-mini': 'openai/gpt-oss-120b:free',
      'codex': 'openai/gpt-oss-120b:free',
      // Google
      'gemini-2-flash': 'google/gemini-2.5-flash',
      'gemini-1-5-pro': 'google/gemini-pro-1.5',
      // Perplexity
      'perplexity-sonar-pro': 'perplexity/sonar-pro',
      // xAI
      'grok-3': 'x-ai/grok-3-beta',
      // Meta
      'llama-3-3-70b': 'meta-llama/llama-3.3-70b-instruct',
      // Free models
      'glm-4-5-air': 'z-ai/glm-4.5-air',
      'hermes-3-405b': 'nousresearch/hermes-3-405b-instruct',
      'qwen3-coder': 'qwen/qwen3-coder-480b-a35b',
      'nemotron-super': 'nvidia/nemotron-3-super-512b',
      'mistral-small': 'mistralai/mistral-small-3.1-24b-instruct',
    };

    return modelMap[modelId] || modelId;
  }
}
