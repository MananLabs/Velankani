// ═══════════════════════════════════════════════════════════
// VEL AI — Tiles Controller (REST API)
// ═══════════════════════════════════════════════════════════

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { TilesService } from './tiles.service';
import { WorkspaceService } from '../workspace/workspace.service';
import type { AuthenticatedRequest } from '../../common/types';
import type { TileType } from '@vel-ai/shared/types/tiles';

@Controller('tiles')
@UseGuards(ClerkAuthGuard)
export class TilesController {
  constructor(
    private readonly tilesService: TilesService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      workspaceId: string;
      tileType: TileType;
      model?: string;
      label?: string;
      positionX: number;
      positionY: number;
      width?: number;
      height?: number;
    },
  ) {
    const canAccess = await this.workspaceService.verifyOwnership(
      body.workspaceId,
      req.user.id,
    );
    if (!canAccess) {
      return { error: 'Workspace access denied' };
    }

    return this.tilesService.create(body.workspaceId, {
      tileType: body.tileType,
      model: body.model,
      label: body.label,
      positionX: body.positionX,
      positionY: body.positionY,
      width: body.width,
      height: body.height,
    });
  }

  @Get('workspace/:workspaceId')
  async findByWorkspace(
    @Req() req: AuthenticatedRequest,
    @Param('workspaceId') workspaceId: string,
  ) {
    const canAccess = await this.workspaceService.verifyOwnership(
      workspaceId,
      req.user.id,
    );
    if (!canAccess) {
      return { error: 'Workspace access denied' };
    }

    return this.tilesService.findByWorkspace(workspaceId);
  }

  @Get(':id')
  async findById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { workspaceId: string },
  ) {
    const canAccess = await this.workspaceService.verifyOwnership(
      body.workspaceId,
      req.user.id,
    );
    if (!canAccess) {
      return { error: 'Workspace access denied' };
    }

    return this.tilesService.findById(id, body.workspaceId);
  }

  @Put(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      workspaceId: string;
      label?: string;
      model?: string;
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
    },
  ) {
    const canAccess = await this.workspaceService.verifyOwnership(
      body.workspaceId,
      req.user.id,
    );
    if (!canAccess) {
      return { error: 'Workspace access denied' };
    }

    return this.tilesService.update(id, body.workspaceId, body);
  }

  @Delete(':id')
  async delete(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { workspaceId: string },
  ) {
    const canAccess = await this.workspaceService.verifyOwnership(
      body.workspaceId,
      req.user.id,
    );
    if (!canAccess) {
      return { error: 'Workspace access denied' };
    }

    return this.tilesService.delete(id, body.workspaceId);
  }

  @Get(':tileId/messages')
  async getMessages(
    @Req() req: AuthenticatedRequest,
    @Param('tileId') tileId: string,
  ) {
    return this.tilesService.getTileMessages(tileId);
  }

  @Post(':tileId/messages')
  async addMessage(
    @Req() req: AuthenticatedRequest,
    @Param('tileId') tileId: string,
    @Body()
    body: {
      workspaceId: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      tokensIn?: number;
      tokensOut?: number;
      model?: string;
      latencyMs?: number;
    },
  ) {
    const canAccess = await this.workspaceService.verifyOwnership(
      body.workspaceId,
      req.user.id,
    );
    if (!canAccess) {
      return { error: 'Workspace access denied' };
    }

    return this.tilesService.addMessage(tileId, body);
  }
}