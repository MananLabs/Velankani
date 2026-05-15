import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  plan?: string;
  creditsRemaining?: number;
}

export function createUsersApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    profile: () => request<UserProfile>('/users/me'),
    completeOnboarding: () =>
      request<{ success: boolean }>('/users/onboarding/complete', {
        method: 'POST',
      }),
  };
}
