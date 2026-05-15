// ═══════════════════════════════════════════════════════════
// VEL AI — Rate Limit Guard (Redis-backed)
// ═══════════════════════════════════════════════════════════

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import type { AuthenticatedRequest } from '../common/types';

const LIMITS: Record<string, { perSecond: number; perMinute: number }> = {
  free: { perSecond: 1, perMinute: 10 },
  pro: { perSecond: 3, perMinute: 60 },
  pro_byok: { perSecond: 5, perMinute: 120 },
  teams: { perSecond: 5, perMinute: 120 },
  enterprise: { perSecond: 10, perMinute: 300 },
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) return true; // Let auth guard handle unauthenticated

    const limits = LIMITS[user.plan] || LIMITS.free;

    // Per-second check
    const secCount = await this.redis.incrWithTTL(
      this.redis.rateLimitSecKey(user.id),
      1,
    );
    if (secCount > limits.perSecond) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Please wait a moment.',
          retryAfter: 1,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Per-minute check
    const minCount = await this.redis.incrWithTTL(
      this.redis.rateLimitMinKey(user.id),
      60,
    );
    if (minCount > limits.perMinute) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Please wait before sending more requests.',
          retryAfter: 60,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
