import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface ResearchRequest {
  query: string;
  workspaceId?: string;
}

export interface ResearchResult {
  summary?: string;
  sources?: Array<{ title: string; url: string }>;
  [key: string]: unknown;
}

export function createResearchApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    trigger: (input: ResearchRequest) =>
      request<ResearchResult>('/research', { method: 'POST', body: input }),
    results: (query: string) =>
      request<ResearchResult>('/research', {
        method: 'POST',
        body: { query },
      }),
  };
}
