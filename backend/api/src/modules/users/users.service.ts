// ═══════════════════════════════════════════════════════════
// VEL AI — Users Service
// ═══════════════════════════════════════════════════════════

import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../database/db';
import { users } from '../../database/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { encrypt } from '../../common/encryption';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findByClerkId(clerkId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));
    return user || null;
  }

  async createFromClerk(data: {
    clerkId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }) {
    const referralCode = uuidv4().slice(0, 8).toUpperCase();
    const name = data.name || null;
    const avatarUrl = data.avatarUrl || null;

    const result = await db.execute(sql`
      INSERT INTO users (clerk_id, email, name, avatar_url, referral_code, plan, credits_remaining, credits_monthly_alloc, credits_used_this_month, onboarding_complete)
      VALUES (${data.clerkId}, ${data.email}, ${name}, ${avatarUrl}, ${referralCode}, 'free', 100, 100, 0, false)
      RETURNING *
    `);

    return result[0];
  }

  async updateFromClerk(
    clerkId: string,
    data: { email?: string; name?: string; avatarUrl?: string },
  ) {
    const setData: Record<string, unknown> = {};
    if (data.email) setData.email = data.email;
    if (data.name) setData.name = data.name;
    if (data.avatarUrl) setData.avatarUrl = data.avatarUrl;

    if (Object.keys(setData).length === 0) return;

    await db
      .update(users)
      .set(setData)
      .where(eq(users.clerkId, clerkId));
  }

  async deleteByClerkId(clerkId: string) {
    await db.execute(sql`DELETE FROM users WHERE clerk_id = ${clerkId}`);
  }

  async completeOnboarding(userId: string) {
    await db.execute(sql`
      UPDATE users SET onboarding_complete = true, updated_at = NOW() WHERE id = ${userId}
    `);
  }

  async updateByokKeys(
    userId: string,
    keys: { openaiKey?: string | null; anthropicKey?: string | null },
  ): Promise<void> {
    const setData: Record<string, unknown> = {};
    if (keys.openaiKey !== undefined) {
      setData.byokOpenaiKey = keys.openaiKey ? encrypt(keys.openaiKey) : null;
    }
    if (keys.anthropicKey !== undefined) {
      setData.byokAnthropicKey = keys.anthropicKey
        ? encrypt(keys.anthropicKey)
        : null;
    }
    if (Object.keys(setData).length === 0) return;
    await db.update(users).set(setData).where(eq(users.id, userId));
  }
}
