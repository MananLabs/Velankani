import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface AnalyticsEvent {
  eventType: string;
  model?: string;
  workspaceId?: string;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}

export function createAnalyticsApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    trackEvent: (event: AnalyticsEvent) =>
      request<{ success?: boolean }>('/analytics/events', {
        method: 'POST',
        body: event,
      }),
  };
}
