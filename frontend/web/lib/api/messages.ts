import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface Message {
  id: string;
  tileId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
  latencyMs?: number;
  createdAt?: string;
}

export interface CreateMessageInput {
  tileId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}

export function createMessagesApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    create: (input: CreateMessageInput) =>
      request<Message>('/messages', { method: 'POST', body: input }),
    listByTile: (tileId: string, limit = 100, offset = 0) =>
      request<Message[]>(
        `/messages/tile/${tileId}?limit=${limit}&offset=${offset}`,
      ),
    getById: (id: string, tileId: string) =>
      request<Message>(`/messages/${id}`, { method: 'GET', body: { tileId } }),
    remove: (id: string, tileId: string) =>
      request<{ success?: boolean }>(`/messages/${id}`, {
        method: 'DELETE',
        body: { tileId },
      }),
    getContext: (tileId: string, lookback = 10) =>
      request<Message[]>(`/messages/context/${tileId}?lookback=${lookback}`),
  };
}
