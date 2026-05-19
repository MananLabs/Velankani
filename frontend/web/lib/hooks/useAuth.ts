// ═══════════════════════════════════════════════════════════
// VEL AI — Auth Hook (Better Auth)
// ═══════════════════════════════════════════════════════════

'use client';

import { useCallback } from 'react';
import { authClient } from '@/lib/auth-client';

export function useAuth() {
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const { data: session } = await authClient.getSession();
      return session?.session?.token || null;
    } catch {
      return null;
    }
  }, []);

  return { getToken };
}
