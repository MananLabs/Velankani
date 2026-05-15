import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamAIInput {
  requestId: string;
  workspaceId: string;
  tileId: string;
  tileType: string;
  model: string;
  messages: AIMessage[];
  contextSources?: string[];
  maxTokens?: number;
}

export interface ConsensusInput {
  prompt: string;
  workspaceId: string;
  tileId: string;
  requestId: string;
}

export interface SSEHandlers {
  onMessage?: (payload: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  onDone?: () => void;
}

async function streamSSE(
  url: string,
  token: string | null,
  body: unknown,
  handlers: SSEHandlers,
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    handlers.onError?.(new Error(`Streaming failed: ${response.status}`));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() || '';

    for (const chunk of chunks) {
      const line = chunk
        .split('\n')
        .find((entry) => entry.startsWith('data: '));
      if (!line) continue;

      const data = line.slice(6).trim();
      if (!data) continue;

      try {
        const payload = JSON.parse(data) as Record<string, unknown>;
        handlers.onMessage?.(payload);
        if (payload.type === 'done') {
          handlers.onDone?.();
          return;
        }
      } catch {
        // Ignore malformed SSE chunks
      }
    }
  }

  handlers.onDone?.();
}

export function createAIApi(getToken: AuthTokenGetter) {
  const authedRequest = createAuthedRequest(getToken);

  return {
    streamChat: async (input: StreamAIInput, handlers: SSEHandlers) => {
      const token = await getToken();
      await streamSSE(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/ai/stream`,
        token,
        input,
        handlers,
      );
    },

    streamConsensus: async (input: ConsensusInput, handlers: SSEHandlers) => {
      const token = await getToken();
      await streamSSE(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/ai/consensus`,
        token,
        input,
        handlers,
      );
    },

    createStream: (input: StreamAIInput) => authedRequest('/ai/stream', { method: 'POST', body: input }),
  };
}
