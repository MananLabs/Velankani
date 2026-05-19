// ═══════════════════════════════════════════════════════════
// VEL AI — Auth Hook (replaces @clerk/nextjs useAuth)
// Placeholder until Better Auth is integrated
// ═══════════════════════════════════════════════════════════

'use client';

import { useCallback } from 'react';

export function useAuth() {
  const getToken = useCallback(async (): Promise<string | null> => {
    // Read session from cookie
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('vel-session='));

    if (!cookie) return null;

    try {
      const session = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
      // Return the user ID as a token placeholder
      // Replace with actual Better Auth token when integrated
      return session.id || null;
    } catch {
      return null;
    }
  }, []);

  return { getToken };
}
