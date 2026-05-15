// ═══════════════════════════════════════════════════════════
// VEL AI — Messages Controller (REST API)
// ═══════════════════════════════════════════════════════════

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { MessagesService } from './messages.service';
import { TilesService } from '../tiles/tiles.service';
import { WorkspaceService } from '../workspace/workspace.service';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('messages')
@UseGuards(ClerkAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly tilesService: TilesService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  private async verifyTileAccess(
    userId: string,
    tileId: string,
  ): Promise<string> {
    const workspaceId = await this.tilesService.resolveWorkspaceId(tileId);
    const canAccess = await this.workspaceService.verifyOwnership(
      workspaceId,
      userId,
    );
    if (!canAccess) {
      throw new ForbiddenException('Access denied');
    }
    return workspaceId;
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      tileId: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      tokensIn?: number;
      tokensOut?: number;
      model?: string;
      latencyMs?: number;
      metadata?: Record<string, unknown>;
    },
  ) {
    await this.verifyTileAccess(req.user.id, body.tileId);
    return this.messagesService.create(body.tileId, body);
  }

  @Get('tile/:tileId')
  async findByTile(
    @Req() req: AuthenticatedRequest,
    @Param('tileId') tileId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    await this.verifyTileAccess(req.user.id, tileId);
    return this.messagesService.findByTile(
      tileId,
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get(':id')
  async findById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tileId') tileId: string,
  ) {
    if (!tileId) throw new NotFoundException('tileId query param required');
    await this.verifyTileAccess(req.user.id, tileId);
    return this.messagesService.findById(id, tileId);
  }

  @Put(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      tileId: string;
      content?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    await this.verifyTileAccess(req.user.id, body.tileId);
    return this.messagesService.update(id, body.tileId, body);
  }

  @Delete(':id')
  async delete(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tileId') tileId: string,
  ) {
    if (!tileId) throw new NotFoundException('tileId query param required');
    await this.verifyTileAccess(req.user.id, tileId);
    return this.messagesService.delete(id, tileId);
  }

  @Get('context/:tileId')
  async getContext(
    @Req() req: AuthenticatedRequest,
    @Param('tileId') tileId: string,
    @Query('lookback') lookback?: string,
  ) {
    await this.verifyTileAccess(req.user.id, tileId);
    return this.messagesService.getConversationContext(
      tileId,
      lookback ? parseInt(lookback, 10) : 10,
    );
  }
}