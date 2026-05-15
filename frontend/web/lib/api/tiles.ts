import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface Tile {
  id: string;
  workspaceId: string;
  tileType: string;
  model?: string | null;
  label?: string | null;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
}

export interface CreateTileInput {
  workspaceId: string;
  tileType: string;
  model?: string;
  label?: string;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
}

export interface UpdateTileInput {
  workspaceId: string;
  label?: string;
  model?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

export interface TileMessageInput {
  workspaceId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
  latencyMs?: number;
}

export function createTilesApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    create: (input: CreateTileInput) =>
      request<Tile>('/tiles', { method: 'POST', body: input }),
    listByWorkspace: (workspaceId: string) =>
      request<Tile[]>(`/tiles/workspace/${workspaceId}`),
    getById: (id: string, workspaceId: string) =>
      request<Tile>(`/tiles/${id}`, { method: 'GET', body: { workspaceId } }),
    update: (id: string, input: UpdateTileInput) =>
      request<Tile>(`/tiles/${id}`, { method: 'PUT', body: input }),
    remove: (id: string, workspaceId: string) =>
      request<{ success?: boolean }>(`/tiles/${id}`, {
        method: 'DELETE',
        body: { workspaceId },
      }),
    getMessages: (tileId: string) => request(`/tiles/${tileId}/messages`),
    addMessage: (tileId: string, input: TileMessageInput) =>
      request(`/tiles/${tileId}/messages`, { method: 'POST', body: input }),
  };
}
