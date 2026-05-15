// ═══════════════════════════════════════════════════════════
// VEL AI — Context Service (Redis-backed Context Injection)
// ═══════════════════════════════════════════════════════════

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

interface ChatMessage {
  role: string;
  content: string;
}

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Builds messages array with context injected from connected tiles.
   * Injects context as a system message before the conversation.
   */
  async buildContextualMessages(
    workspaceId: string,
    tileId: string,
    messages: ChatMessage[],
    contextSources: string[],
  ): Promise<ChatMessage[]> {
    if (!contextSources.length) return messages;

    const contextParts: string[] = [];

    for (const sourceId of contextSources) {
      try {
        const context = await this.redis.getContext(workspaceId, sourceId);
        if (context) {
          contextParts.push(
            `[Context from connected tile ${sourceId}]:\n${context}`,
          );
        }
      } catch (err) {
        this.logger.warn(
          `Failed to fetch context for tile ${sourceId}: ${err}`,
        );
      }
    }

    if (!contextParts.length) return messages;

    const contextMessage: ChatMessage = {
      role: 'system',
      content:
        'The following context has been shared from connected tiles in the workspace. ' +
        'Use it to provide more informed and contextual responses.\n\n' +
        contextParts.join('\n\n---\n\n'),
    };

    // Inject context as first system message
    return [contextMessage, ...messages];
  }

  /**
   * Updates the context cache for a tile after AI response completes.
   * Stores the most recent response content for injection into connected tiles.
   */
  async updateTileContext(
    workspaceId: string,
    tileId: string,
    content: string,
  ): Promise<void> {
    try {
      await this.redis.setContext(workspaceId, tileId, content);
    } catch (err) {
      this.logger.error(`Failed to update context for tile ${tileId}: ${err}`);
    }
  }

  /**
   * Retrieves context for a specific tile.
   */
  async getTileContext(
    workspaceId: string,
    tileId: string,
  ): Promise<string | null> {
    return this.redis.getContext(workspaceId, tileId);
  }

  /**
   * Clears context when a tile is removed.
   */
  async clearTileContext(
    workspaceId: string,
    tileId: string,
  ): Promise<void> {
    await this.redis.del(this.redis.contextKey(workspaceId, tileId));
  }
}
