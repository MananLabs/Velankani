// ═══════════════════════════════════════════════════════════
// VEL AI — AI Service (OpenRouter Integration)
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

  async *createStream(options: StreamOptions): AsyncGenerator<StreamChunk> {
    const { model, messages, maxTokens = 4096 } = options;

    const openRouterId = this.resolveModelId(model);

    let apiKey = process.env.OPENROUTER_API_KEY_CLAUDE && openRouterId.includes('claude')
      ? process.env.OPENROUTER_API_KEY_CLAUDE
      : process.env.OPENROUTER_API_KEY_GEMINI && (openRouterId.includes('gemini') || openRouterId.includes('google'))
      ? process.env.OPENROUTER_API_KEY_GEMINI
      : process.env.OPENROUTER_API_KEY;
    if (options.byokKey) {
      const keyProvider = this.getKeyProvider(model);
      if (keyProvider === 'openai' && options.byokKey) {
        apiKey = options.byokKey;
      } else if (keyProvider === 'anthropic' && options.user.byokAnthropicKey) {
        apiKey = options.user.byokAnthropicKey;
      }
    }

    if (!apiKey) {
      throw new Error('No API key configured');
    }

    const isDirectApi = this.isDirectApiModel(openRouterId);
    const endpoint = isDirectApi
      ? this.getDirectApiEndpoint(openRouterId)
      : 'https://openrouter.ai/api/v1/chat/completions';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'https://vel.ai',
      'X-Title': 'VEL AI Workspace',
    };

    if (isDirectApi) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const requestBody: Record<string, unknown> = isDirectApi
      ? {
          model: this.getDirectModelId(openRouterId),
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: maxTokens,
          stream: true,
          ...(openRouterId.includes('claude') ? {} : { temperature: 0.7 }),
        }
      : {
          model: openRouterId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: maxTokens,
          stream: true,
          temperature: 0.7,
        };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
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
          if (data === '[DONE]') {
            return;
          }

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
      'claude-opus-4': 'anthropic/claude-opus-4',
      'claude-sonnet-4': 'anthropic/claude-sonnet-4',
      'claude-haiku-3-5': 'anthropic/claude-3.5-haiku',
      'gpt-4o': 'openai/gpt-4o',
      'gpt-4-1': 'openai/gpt-4.1',
      'o3-mini': 'openai/o3-mini',
      'codex': 'openai/codex-mini-latest',
      'gemini-2-flash': 'google/gemini-2.0-flash-001',
      'gemini-1-5-pro': 'google/gemini-pro-1.5',
      'perplexity-sonar-pro': 'perplexity/sonar-pro',
      'grok-3': 'x-ai/grok-3-beta',
      'llama-3-3-70b': 'meta-llama/llama-3.3-70b-instruct',
      'glm-4-5-air': 'z-ai/glm-4.5-air',
      'hermes-3-405b': 'nousresearch/hermes-3-405b-instruct',
      'qwen3-coder': 'qwen/qwen3-coder-480b-a35b',
      'nemotron-super': 'nvidia/nemotron-3-super-512b',
      'mistral-small': 'mistralai/mistral-small-3.1-24b-instruct',
    };

    return modelMap[modelId] || modelId;
  }

  private getKeyProvider(modelId: string): 'openai' | 'anthropic' | 'openrouter' {
    if (modelId.includes('openai') || modelId.includes('gpt')) return 'openai';
    if (modelId.includes('anthropic') || modelId.includes('claude')) return 'anthropic';
    return 'openrouter';
  }

  private isDirectApiModel(modelId: string): boolean {
    if (modelId.includes('anthropic') && !process.env.ANTHROPIC_API_KEY) return false;
    if (modelId.includes('openai') && !process.env.OPENAI_API_KEY) return false;
    return modelId.includes('anthropic') || modelId.includes('openai');
  }

  private getDirectApiEndpoint(modelId: string): string {
    if (modelId.includes('anthropic')) {
      return 'https://api.anthropic.com/v1/messages';
    }
    if (modelId.includes('openai')) {
      return 'https://api.openai.com/v1/chat/completions';
    }
    return 'https://openrouter.ai/api/v1/chat/completions';
  }

  private getDirectModelId(modelId: string): string {
    if (modelId.includes('claude-opus-4')) return 'claude-opus-4-20250514';
    if (modelId.includes('claude-sonnet-4')) return 'claude-sonnet-4-20250514';
    if (modelId.includes('claude-haiku')) return 'claude-3-5-haiku-20240620';
    if (modelId.includes('gpt-4o')) return 'gpt-4o';
    if (modelId.includes('gpt-4.1')) return 'gpt-4.1';
    if (modelId.includes('o3-mini')) return 'o3-mini';
    return modelId;
  }
}
