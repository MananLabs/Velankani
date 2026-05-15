import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { AnalyticsService } from './analytics.service';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('analytics')
@UseGuards(ClerkAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  async trackEvent(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      eventType: string;
      model?: string;
      tileType?: string;
      workspaceId?: string;
      tokensIn?: number;
      tokensOut?: number;
      latencyMs?: number;
      metadata?: Record<string, unknown>;
    },
  ) {
    await this.analyticsService.recordEvent({
      userId: req.user.id,
      eventType: body.eventType,
      model: body.model,
      tileType: body.tileType,
      workspaceId: body.workspaceId,
      tokensIn: body.tokensIn,
      tokensOut: body.tokensOut,
      latencyMs: body.latencyMs,
      metadata: body.metadata,
    });

    return { success: true };
  }
}
