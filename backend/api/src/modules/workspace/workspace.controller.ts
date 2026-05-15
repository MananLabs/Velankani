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
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { WorkspaceService } from './workspace.service';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('workspaces')
@UseGuards(ClerkAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.workspaceService.findAllByUser(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workspaceService.findById(id, req.user.id);
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: { name: string; description?: string; templateId?: string },
  ) {
    return this.workspaceService.create(req.user.id, body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      name?: string;
      description?: string;
      canvasState?: unknown;
      contextGraph?: unknown;
      tileCount?: number;
    },
  ) {
    return this.workspaceService.update(id, req.user.id, body);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workspaceService.delete(id, req.user.id);
  }
}
