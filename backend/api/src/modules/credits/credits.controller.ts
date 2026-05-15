import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { CreditsService } from './credits.service';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('credits')
@UseGuards(ClerkAuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance')
  async getBalance(@Req() req: AuthenticatedRequest) {
    const balance = await this.creditsService.getBalance(req.user.id);
    return { balance };
  }
}
