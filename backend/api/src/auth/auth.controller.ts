// ═══════════════════════════════════════════════════════════
// VEL AI — Better Auth Route Handler (NestJS)
// ═══════════════════════════════════════════════════════════

import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';

const handler = toNodeHandler(auth);

@Controller('auth')
export class AuthController {
  @All()
  async handleAuthRoot(@Req() req: Request, @Res() res: Response) {
    return handler(req, res);
  }

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return handler(req, res);
  }
}
