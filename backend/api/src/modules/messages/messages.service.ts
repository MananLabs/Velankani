// ═══════════════════════════════════════════════════════════
// VEL AI — Messages Service (Chat History Persistence)
// ═══════════════════════════════════════════════════════════

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { db } from '../../database/db';
import { messages } from '../../database/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  async create(
    tileId: string,
    data: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      tokensIn?: number;
      tokensOut?: number;
      model?: string;
      latencyMs?: number;
      metadata?: Record<string, unknown>;
    },
  ) {
    const [message] = await db
      .insert(messages)
      .values({
        id: uuidv4(),
        tileId,
        role: data.role,
        content: data.content,
        tokensIn: data.tokensIn || 0,
        tokensOut: data.tokensOut || 0,
        model: data.model || null,
        latencyMs: data.latencyMs || null,
        metadata: data.metadata || null,
      })
      .returning();

    return message;
  }

  async findByTile(tileId: string, limit = 100, offset = 0) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.tileId, tileId))
      .orderBy(asc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string, tileId: string) {
    const [message] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), eq(messages.tileId, tileId)));

    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async update(
    id: string,
    tileId: string,
    data: { content?: string; metadata?: Record<string, unknown> },
  ) {
    const [message] = await db
      .update(messages)
      .set({
        ...(data.content !== undefined && { content: data.content }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      })
      .where(and(eq(messages.id, id), eq(messages.tileId, tileId)))
      .returning();

    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async delete(id: string, tileId: string) {
    const result = await db
      .delete(messages)
      .where(and(eq(messages.id, id), eq(messages.tileId, tileId)))
      .returning();

    if (!result.length) {
      throw new NotFoundException('Message not found');
    }
    return { deleted: true };
  }

  async deleteAllByTile(tileId: string) {
    return db.delete(messages).where(eq(messages.tileId, tileId));
  }

  async getConversationContext(tileId: string, lookbackMessages = 10) {
    return db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.tileId, tileId))
      .orderBy(desc(messages.createdAt))
      .limit(lookbackMessages);
  }
}