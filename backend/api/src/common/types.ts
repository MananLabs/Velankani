// ═══════════════════════════════════════════════════════════
// VEL AI — Common Types
// ═══════════════════════════════════════════════════════════

import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  clerkId: string;
  email: string;
  plan: string;
  creditsRemaining: number;
  byokOpenaiKey: string | null;
  byokAnthropicKey: string | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
