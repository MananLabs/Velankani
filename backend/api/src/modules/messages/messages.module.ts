// ═══════════════════════════════════════════════════════════
// VEL AI — Messages Module
// ═══════════════════════════════════════════════════════════

import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TilesModule } from '../tiles/tiles.module';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [TilesModule, WorkspaceModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}