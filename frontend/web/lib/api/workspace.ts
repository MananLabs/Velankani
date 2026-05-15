import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  templateId?: string | null;
  tileCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  templateId?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  canvasState?: unknown;
  contextGraph?: unknown;
  tileCount?: number;
}

export function createWorkspaceApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    list: () => request<Workspace[]>('/workspaces'),
    getById: (id: string) => request<Workspace>(`/workspaces/${id}`),
    create: (input: CreateWorkspaceInput) =>
      request<Workspace>('/workspaces', { method: 'POST', body: input }),
    update: (id: string, input: UpdateWorkspaceInput) =>
      request<Workspace>(`/workspaces/${id}`, { method: 'PUT', body: input }),
    remove: (id: string) =>
      request<{ success?: boolean }>(`/workspaces/${id}`, {
        method: 'DELETE',
      }),
  };
}
