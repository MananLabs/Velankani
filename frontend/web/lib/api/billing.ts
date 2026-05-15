import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface CheckoutResponse {
  checkoutUrl: string;
}

export function createBillingApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    checkout: (priceId: string) =>
      request<CheckoutResponse>('/billing/checkout', {
        method: 'POST',
        body: { priceId },
      }),
    topUp: (priceId: string) =>
      request<CheckoutResponse>('/billing/top-up', {
        method: 'POST',
        body: { priceId },
      }),
    plans: () =>
      Promise.resolve([
        { id: 'free', label: 'Free' },
        { id: 'pro', label: 'Pro' },
        { id: 'pro_byok', label: 'Pro BYOK' },
        { id: 'teams', label: 'Teams' },
      ]),
  };
}
