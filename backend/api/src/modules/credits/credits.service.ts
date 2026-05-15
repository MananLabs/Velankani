// ═══════════════════════════════════════════════════════════
// VEL AI — Credits Service (Atomic Redis-Based Deduction)
// ═══════════════════════════════════════════════════════════

import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { db } from '../../database/db';
import { users, creditTransactions } from '../../database/schema';
import { eq, sql } from 'drizzle-orm';
import { getModel } from '@vel-ai/shared/types/models';
type CreditTxReason =
  | 'ai_inference'
  | 'consensus_mode'
  | 'research_agent'
  | 'monthly_allocation'
  | 'top_up'
  | 'referral'
  | 'admin_grant'
  | 'refund';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private readonly redis: RedisService) {}

  async reserveCredits(
    userId: string,
    requestId: string,
    modelId: string,
  ): Promise<number> {
    const model = getModel(modelId);
    if (!model) throw new ForbiddenException('Unknown model');

    const estimatedCredits = model.creditsPerMessage;
    const lockKey = this.redis.creditLockKey(userId, requestId);

    const locked = await this.redis.setNX(
      lockKey,
      { credits: estimatedCredits, modelId },
      30,
    );
    if (!locked) throw new ForbiddenException('Request already in flight');

    const [user] = await db
      .select({ creditsRemaining: users.creditsRemaining })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || user.creditsRemaining < estimatedCredits) {
      await this.redis.del(lockKey);
      throw new ForbiddenException('Insufficient credits');
    }

    return estimatedCredits;
  }

  async finalizeDeduction(
    userId: string,
    requestId: string,
    modelId: string,
    tokensIn: number,
    tokensOut: number,
  ): Promise<void> {
    const model = getModel(modelId);
    const creditsToDeduct = model?.creditsPerMessage || 5;

    await db
      .update(users)
      .set({
        creditsRemaining: sql`credits_remaining - ${creditsToDeduct}`,
        creditsUsedThisMonth: sql`credits_used_this_month + ${creditsToDeduct}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await db.insert(creditTransactions).values({
      userId,
      amount: -creditsToDeduct,
      reason: 'ai_inference',
      modelUsed: modelId,
      tokensIn,
      tokensOut,
      requestId,
    });

    await this.redis.del(this.redis.creditLockKey(userId, requestId));
  }

  async releaseReservation(
    userId: string,
    requestId: string,
  ): Promise<void> {
    await this.redis.del(this.redis.creditLockKey(userId, requestId));
  }

  async getBalance(userId: string): Promise<number> {
    const [user] = await db
      .select({ creditsRemaining: users.creditsRemaining })
      .from(users)
      .where(eq(users.id, userId));
    return user?.creditsRemaining ?? 0;
  }

  async addCredits(
    userId: string,
    amount: number,
    reason: CreditTxReason,
  ): Promise<void> {
    await db
      .update(users)
      .set({
        creditsRemaining: sql`credits_remaining + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await db.insert(creditTransactions).values({
      userId,
      amount,
      reason,
    });
  }
}
