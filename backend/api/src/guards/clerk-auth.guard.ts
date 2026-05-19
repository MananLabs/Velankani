// ═══════════════════════════════════════════════════════════
// VEL AI — Auth Guard (Placeholder for Better Auth)
// ═══════════════════════════════════════════════════════════

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

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
        plan: 'free',
        creditsRemaining: 1000,
        byokOpenaiKey: null,
        byokAnthropicKey: null,
      };
      return true;
    }

    if (!authHeader?.startsWith('Bearer ')) {
      // In development without auth configured, allow requests through
      if (process.env.NODE_ENV === 'development') {
        request.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'dev@vel.ai',
          name: 'Dev User',
          plan: 'free',
          creditsRemaining: 1000,
          byokOpenaiKey: null,
          byokAnthropicKey: null,
        };
        return true;
      }
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    // TODO: Replace with Better Auth token verification
    // For now, accept any token in development
    if (process.env.NODE_ENV === 'development') {
      request.user = {
        id: token || '00000000-0000-0000-0000-000000000001',
        email: 'dev@vel.ai',
        name: 'Dev User',
        plan: 'free',
        creditsRemaining: 1000,
        byokOpenaiKey: null,
        byokAnthropicKey: null,
      };
      return true;
    }

    // Production: verify token with Better Auth
    // TODO: Implement Better Auth verification here
    throw new UnauthorizedException('Auth not configured');
  }
}
