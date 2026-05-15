import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { ContextModule } from '../context/context.module';
import { CreditsModule } from '../credits/credits.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [ContextModule, CreditsModule, AnalyticsModule, WorkspaceModule, RedisModule],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
