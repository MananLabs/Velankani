// ═══════════════════════════════════════════════════════════
// VEL AI — Auth Guard (Better Auth Session Verification)
// ═══════════════════════════════════════════════════════════

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { auth } from '../auth/auth';
import { fromNodeHeaders } from 'better-auth/node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger('AuthGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Dev bypass — allows running without auth configured
    const devBypass = process.env.AUTH_DEV_BYPASS;

    if (devBypass && devBypass.length >= 16) {
      this.logger.debug('Dev bypass active');
      const devUserId =
        request.headers?.['x-dev-user-id'] ||
        '00000000-0000-0000-0000-000000000001';
      request.user = {
        id: devUserId,
        email: 'dev@vel.ai',
        name: 'Dev User',
        plan: 'pro',
        creditsRemaining: 1000,
        byokOpenaiKey: null,
        byokAnthropicKey: null,
      };
      return true;
    }

    // If Better Auth secret is not configured, allow in development
    if (!process.env.BETTER_AUTH_SECRET) {
      if (process.env.NODE_ENV === 'development') {
        request.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'dev@vel.ai',
          name: 'Dev User',
          plan: 'pro',
          creditsRemaining: 1000,
          byokOpenaiKey: null,
          byokAnthropicKey: null,
        };
        return true;
      }
      throw new UnauthorizedException('Auth not configured');
    }

    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session || !session.user) {
        // In development, allow through if session verification fails
        if (process.env.NODE_ENV === 'development') {
          request.user = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'dev@vel.ai',
            name: 'Dev User',
            plan: 'pro',
            creditsRemaining: 1000,
            byokOpenaiKey: null,
            byokAnthropicKey: null,
          };
          return true;
        }
        throw new UnauthorizedException('Invalid or expired session');
      }

      // Attach user to request
      request.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        plan: 'pro', // All authenticated users get full model access
        creditsRemaining: 1000,
        byokOpenaiKey: null,
        byokAnthropicKey: null,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // In development, allow through even if auth fails
        if (process.env.NODE_ENV === 'development') {
          request.user = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'dev@vel.ai',
            name: 'Dev User',
            plan: 'pro',
            creditsRemaining: 1000,
            byokOpenaiKey: null,
            byokAnthropicKey: null,
          };
          return true;
        }
        throw error;
      }
      this.logger.error(`Auth verification failed: ${error}`);
      if (process.env.NODE_ENV === 'development') {
        request.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'dev@vel.ai',
          name: 'Dev User',
          plan: 'pro',
          creditsRemaining: 1000,
          byokOpenaiKey: null,
          byokAnthropicKey: null,
        };
        return true;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
