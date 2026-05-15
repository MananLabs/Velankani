// ═══════════════════════════════════════════════════════════
// VEL AI — SSE Streaming Hook
// ═══════════════════════════════════════════════════════════

'use client';

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@clerk/nextjs';
import type { TileType } from '@vel-ai/shared/types/tiles';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface StreamOptions {
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  tileId: string;
  tileType?: TileType;
  workspaceId: string;
  contextSources: string[];
  maxTokens?: number;
  onDelta: (content: string) => void;
  onContextInjected?: () => void;
  onDone: (totalTokens: number) => void;
  onError: (message: string) => void;
}

export function useAIStream() {
  const { getToken } = useAuth();

  const stream = useCallback(
    async (options: StreamOptions) => {
      const requestId = uuidv4();
      const token = await getToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/ai/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: options.model,
          messages: options.messages,
          tileId: options.tileId,
          tileType: options.tileType || 'ai-chat',
          workspaceId: options.workspaceId,
          contextSources: options.contextSources,
          maxTokens: options.maxTokens || 4096,
          requestId,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        options.onError(`Request failed: ${response.status}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        options.onError('No response stream');
        return;
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
            if (!trimmed.startsWith('data: ')) continue;

            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              switch (parsed.type) {
                case 'delta':
                  options.onDelta(parsed.content || '');
                  break;
                case 'context_injected':
                  options.onContextInjected?.();
                  break;
                case 'done':
                  options.onDone(
                    (parsed.tokensIn || 0) + (parsed.tokensOut || 0),
                  );
                  break;
                case 'error':
                  options.onError(parsed.message || 'Stream error');
                  break;
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err) {
        options.onError(
          err instanceof Error ? err.message : 'Stream interrupted',
        );
      } finally {
        reader.releaseLock();
      }
    },
    [getToken],
  );

  return { stream };
}
