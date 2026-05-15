// ═══════════════════════════════════════════════════════════
// VEL AI — Tiles Module
// ═══════════════════════════════════════════════════════════

import { Module } from '@nestjs/common';
import { TilesController } from './tiles.controller';
import { TilesService } from './tiles.service';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [WorkspaceModule],
  controllers: [TilesController],
  providers: [TilesService],
  exports: [TilesService],
})
export class TilesModule {}