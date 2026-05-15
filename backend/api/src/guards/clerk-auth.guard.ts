// ═══════════════════════════════════════════════════════════
// VEL AI — Clerk Auth Guard (Production-Ready JWT Verification)
// ═══════════════════════════════════════════════════════════

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { db } from '../database/db';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

interface AuthPayload {
  sub?: string;
  sid?: string;
  email?: string;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    const devBypass = process.env.CLERK_DEV_BYPASS;

    if (devBypass && devBypass.length >= 16) {
      this.logger.debug('Dev bypass active');
      const devUserId =
        request.headers?.['x-dev-user-id'] ||
        '00000000-0000-0000-0000-000000000001';
      request.user = {
        id: devUserId,
        clerkId: devUserId,
        email: 'dev@vel.ai',
        name: 'Dev User',
        plan: 'free',
        creditsRemaining: 1000,
      };
      return true;
    }

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.verifyToken(token);

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      let user;
      try {
        [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, payload.sub));
      } catch {
        this.logger.error('Database unavailable');
        throw new UnauthorizedException('Service unavailable');
      }

      if (!user) {
        try {
          const clerkEmail = payload.email || 'unknown';
          [user] = await db
            .insert(users)
            .values({
              clerkId: payload.sub,
              email: clerkEmail,
              name: 'User',
              plan: 'free',
              creditsRemaining: 100,
            })
            .returning();
        } catch {
          this.logger.error('Could not create user in DB');
          throw new UnauthorizedException('Could not provision user');
        }
      }

      request.user = user;
      return true;
    } catch (error) {
      this.logger.error(`Auth failed: ${error}`);
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Token verification failed');
    }
  }

  private async verifyToken(token: string): Promise<AuthPayload> {
    try {
      if (!process.env.CLERK_SECRET_KEY) {
        throw new UnauthorizedException('CLERK_SECRET_KEY not configured');
      }

      const { verifyToken } = await import('@clerk/backend');
      const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (!verified?.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return verified as AuthPayload;
    } catch (err) {
      this.logger.error(`Token verification error: ${err}`);
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
