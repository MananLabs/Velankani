// ═══════════════════════════════════════════════════════════
// VEL AI — Token Budget Guard
// ═══════════════════════════════════════════════════════════

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { getModel } from '@vel-ai/shared/types/models';
import type { AuthenticatedRequest } from '../common/types';

@Injectable()
export class TokenBudgetGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const body = request.body;

    if (!body?.model) return true;

    // BYOK users skip credit checks
    if (user.plan === 'pro_byok') return true;

    const model = getModel(body.model);
    if (!model) return true;

    const requiredCredits = model.creditsPerMessage;

    if (user.creditsRemaining < requiredCredits) {
      throw new ForbiddenException(
        `Insufficient credits. Need ${requiredCredits} but have ${user.creditsRemaining}. ` +
          `Top up your credits or switch to a cheaper model.`,
      );
    }

    return true;
  }
}
