// ═══════════════════════════════════════════════════════════
// VEL AI — Prompt Limit Guard
// ═══════════════════════════════════════════════════════════

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

const MAX_PROMPT_CHARS: Record<string, number> = {
  free: 4000,
  pro: 16000,
  pro_byok: 32000,
  teams: 32000,
  enterprise: 64000,
};

@Injectable()
export class PromptLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;

    if (!body?.messages || !Array.isArray(body.messages)) {
      return true;
    }

    const maxChars = MAX_PROMPT_CHARS[user?.plan] || MAX_PROMPT_CHARS.free;
    const totalChars = body.messages.reduce(
      (sum: number, msg: { content?: string }) =>
        sum + (msg.content?.length || 0),
      0,
    );

    if (totalChars > maxChars) {
      throw new BadRequestException(
        `Total message content exceeds ${maxChars} character limit for your plan. ` +
          `Current: ${totalChars} characters.`,
      );
    }

    return true;
  }
}
