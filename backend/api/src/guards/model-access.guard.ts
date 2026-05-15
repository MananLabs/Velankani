// ═══════════════════════════════════════════════════════════
// VEL AI — Model Access Guard
// ═══════════════════════════════════════════════════════════

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { getModel } from '@vel-ai/shared/types/models';
import type { AuthenticatedRequest } from '../common/types';

// Models available per plan
const PLAN_MODEL_ACCESS: Record<string, string[]> = {
  free: [
    'claude-haiku-3-5',
    'gpt-4o',
    'gemini-2-flash',
    'llama-3-3-70b',
  ],
  pro: ['*'], // All models
  pro_byok: ['*'],
  teams: ['*'],
  enterprise: ['*'],
};

@Injectable()
export class ModelAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const body = request.body;

    if (!body?.model) return true;

    const modelId =
      typeof body.model === 'string' ? body.model : body.model?.id;

    const model = getModel(modelId);
    if (!model) {
      throw new ForbiddenException(`Unknown model: ${modelId}`);
    }

    if (!model.available) {
      throw new ForbiddenException(
        `${model.name} is not yet available. Coming soon in V2.`,
      );
    }

    const allowedModels = PLAN_MODEL_ACCESS[user.plan] || PLAN_MODEL_ACCESS.free;
    if (allowedModels[0] !== '*' && !allowedModels.includes(model.id)) {
      throw new ForbiddenException(
        `${model.name} requires a Pro plan or higher. Upgrade to access all models.`,
      );
    }

    return true;
  }
}
