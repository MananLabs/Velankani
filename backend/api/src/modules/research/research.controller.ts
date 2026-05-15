// ═══════════════════════════════════════════════════════════
// VEL AI — Research Controller (Web Search API)
// ═══════════════════════════════════════════════════════════

import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { ResearchService } from './research.service';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('research')
@UseGuards(ClerkAuthGuard)
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  async research(
    @Req() req: AuthenticatedRequest,
    @Body() body: { query: string; workspaceId?: string },
  ) {
    return this.researchService.research(body.query);
  }
}