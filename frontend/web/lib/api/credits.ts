import { createAuthedRequest, type AuthTokenGetter } from '@/lib/api/client';

export interface CreditBalance {
  balance: number;
}

export function createCreditsApi(getToken: AuthTokenGetter) {
  const request = createAuthedRequest(getToken);

  return {
    getBalance: () => request<CreditBalance>('/credits/balance'),
  };
}
