// ═══════════════════════════════════════════════════════════
// VEL AI — AI Controller (Core Streaming Endpoints)
// ═══════════════════════════════════════════════════════════

import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { RateLimitGuard } from '../../guards/rate-limit.guard';
import { PromptLimitGuard } from '../../guards/prompt-limit.guard';
import { ModelAccessGuard } from '../../guards/model-access.guard';
import { TokenBudgetGuard } from '../../guards/token-budget.guard';
import { AIService } from './ai.service';
import { ContextService } from '../context/context.service';
import { CreditsService } from '../credits/credits.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { StreamAIDto } from './dto/stream-ai.dto';
import { ConsensusStreamDto } from './dto/consensus-stream.dto';
import type { AuthenticatedRequest } from '../../common/types';
import { decrypt, isEncrypted } from '../../common/encryption';
import { CONSENSUS_CREDITS, CONSENSUS_MODEL_IDS, AI_MODELS } from '@vel-ai/shared/types/models';

@Controller('ai')
@UseGuards(ClerkAuthGuard)
export class AIController {
  private readonly logger = new Logger(AIController.name);

  constructor(
    private readonly aiService: AIService,
    private readonly contextService: ContextService,
    private readonly creditsService: CreditsService,
    private readonly analyticsService: AnalyticsService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  private resolveByokKey(
    openaiKey: string | null,
    anthropicKey: string | null,
  ): string | null {
    const raw = openaiKey || anthropicKey;
    if (!raw) return null;
    if (isEncrypted(raw)) {
      try {
        return decrypt(raw);
      } catch {
        this.logger.error('Failed to decrypt BYOK key');
        return null;
      }
    }
    return raw;
  }

  @Post('stream')
  @HttpCode(200)
  @UseGuards(RateLimitGuard, PromptLimitGuard, ModelAccessGuard, TokenBudgetGuard)
  async streamAI(
    @Req() req: AuthenticatedRequest,
    @Body() dto: StreamAIDto,
    @Res() res: Response,
  ): Promise<void> {
    const startTime = Date.now();

    // Skip workspace ownership check if DB is not configured
    if (process.env.DATABASE_URL) {
      const canAccess = await this.workspaceService.verifyOwnership(
        dto.workspaceId,
        req.user.id,
      );
      if (!canAccess) {
        res.setHeader('Content-Type', 'application/json');
        res.status(403).end(JSON.stringify({ error: 'Workspace access denied' }));
        return;
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    const allowedOrigin =
      process.env.ALLOWED_ORIGINS?.split(',')[0]?.trim() ||
      process.env.FRONTEND_URL ||
      '';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.flushHeaders();

    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let fullContent = '';

    try {
      const messagesWithContext =
        await this.contextService.buildContextualMessages(
          dto.workspaceId,
          dto.tileId,
          dto.messages,
          dto.contextSources || [],
        );

      const stream = this.aiService.createStream({
        model: dto.model,
        messages: messagesWithContext,
        user: req.user,
        byokKey: this.resolveByokKey(req.user.byokOpenaiKey, req.user.byokAnthropicKey),
        maxTokens: dto.maxTokens || 4096,
      });

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          res.write(
            `data: ${JSON.stringify({ type: 'delta', content })}\n\n`,
          );
        }

        if (chunk.usage) {
          totalTokensIn = chunk.usage.prompt_tokens || 0;
          totalTokensOut = chunk.usage.completion_tokens || 0;
        }
      }

      const latencyMs = Date.now() - startTime;

      try {
        await Promise.all([
          this.contextService.updateTileContext(
            dto.workspaceId,
            dto.tileId,
            fullContent,
          ),
          this.creditsService.finalizeDeduction(
            req.user.id,
            dto.requestId,
            dto.model,
            totalTokensIn,
            totalTokensOut,
          ),
          this.analyticsService.recordAIUsage({
            userId: req.user.id,
            model: dto.model,
            tileType: dto.tileType,
            workspaceId: dto.workspaceId,
            tokensIn: totalTokensIn,
            tokensOut: totalTokensOut,
            latencyMs,
          }),
        ]);
      } catch (err) {
        this.logger.error('Post-stream processing error:', err);
      }

      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          tokensIn: totalTokensIn,
          tokensOut: totalTokensOut,
          latencyMs,
        })}\n\n`,
      );
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.write(
        `data: ${JSON.stringify({ type: 'error', message })}\n\n`,
      );
      res.end();
      await this.creditsService.releaseReservation(
        req.user.id,
        dto.requestId,
      );
    }
  }

  @Post('consensus')
  @HttpCode(200)
  @UseGuards(RateLimitGuard, PromptLimitGuard)
  async consensusStream(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ConsensusStreamDto,
    @Res() res: Response,
  ): Promise<void> {
    // Skip workspace ownership check if DB is not configured
    if (process.env.DATABASE_URL) {
      const canAccess = await this.workspaceService.verifyOwnership(
        dto.workspaceId,
        req.user.id,
      );
      if (!canAccess) {
        res.setHeader('Content-Type', 'application/json');
        res.status(403).end(JSON.stringify({ error: 'Workspace access denied' }));
        return;
      }
    }

    const reservedCredits = await this.creditsService.reserveCredits(
      req.user.id,
      dto.requestId,
      'consensus',
    ).catch(() => null);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const CONSENSUS_MODELS = CONSENSUS_MODEL_IDS.map((modelId) => {
      const model = AI_MODELS.find((m) => m.id === modelId);
      return {
        id: modelId,
        openRouterId: model?.openRouterId || modelId,
        label: (model?.provider || 'unknown') as 'claude' | 'gpt' | 'gemini',
      };
    });

    const chatMessages = [
      { role: 'user' as const, content: dto.prompt },
    ];
    const results: Record<string, string> = {};
    let successCount = 0;

    try {
      await Promise.allSettled(
        CONSENSUS_MODELS.map(async (model) => {
          try {
            const stream = this.aiService.createStream({
              model: model.openRouterId,
              messages: chatMessages,
              user: req.user,
              maxTokens: 2048,
            });

            let content = '';
            for await (const chunk of stream) {
              const delta = chunk.choices?.[0]?.delta?.content || '';
              if (delta) {
                content += delta;
                res.write(
                  `data: ${JSON.stringify({
                    type: 'delta',
                    model: model.label,
                    content: delta,
                  })}\n\n`,
                );
              }
            }
            results[model.label] = content;
            successCount++;
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            res.write(
              `data: ${JSON.stringify({
                type: 'error',
                model: model.label,
                message,
              })}\n\n`,
            );
          }
        }),
      );

      if (successCount >= 2) {
        res.write(
          `data: ${JSON.stringify({ type: 'synthesis_start' })}\n\n`,
        );

        const synthesisPrompt = `You received three AI responses to this prompt:
"${dto.prompt}"

Claude said: ${results.claude || 'Error'}
GPT-4o said: ${results.gpt || 'Error'}
Gemini said: ${results.gemini || 'Error'}

Synthesize these responses into a structured analysis:
1. **Key Agreements**: Points all models agree on
2. **Notable Differences**: Where models diverge and why
3. **Strongest Combined Answer**: The most comprehensive response drawing on all three
4. **Confidence Assessment**: Rate each model's response quality (High/Medium/Low)

Be concise and direct.`;

        const synthesisStream = this.aiService.createStream({
          model: 'anthropic/claude-sonnet-4',
          messages: [{ role: 'user', content: synthesisPrompt }],
          user: req.user,
          maxTokens: 1024,
        });

        for await (const chunk of synthesisStream) {
          const delta = chunk.choices?.[0]?.delta?.content || '';
          if (delta) {
            res.write(
              `data: ${JSON.stringify({
                type: 'synthesis_delta',
                content: delta,
              })}\n\n`,
            );
          }
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();

      if (reservedCredits) {
        setImmediate(async () => {
          try {
            await this.creditsService.finalizeDeduction(
              req.user.id,
              dto.requestId,
              'consensus',
              0,
              0,
            );
          } catch (err) {
            console.error('Consensus credit deduction error:', err);
          }
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.write(
        `data: ${JSON.stringify({ type: 'error', message })}\n\n`,
      );
      res.end();
      if (dto.requestId) {
        await this.creditsService.releaseReservation(req.user.id, dto.requestId);
      }
    }
  }
}
