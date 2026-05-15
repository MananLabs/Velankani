// ═══════════════════════════════════════════════════════════
// VEL AI — Tiles Service (Tile CRUD + Persistence)
// ═══════════════════════════════════════════════════════════

import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { db } from '../../database/db';
import { tiles } from '../../database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TilesService {
  private readonly logger = new Logger(TilesService.name);

  async create(
    workspaceId: string,
    data: {
      reactFlowId?: string;
      tileType: string;
      model?: string;
      label?: string;
      positionX: number;
      positionY: number;
      width?: number;
      height?: number;
    },
  ) {
    const id = uuidv4();
    const reactFlowId = data.reactFlowId || uuidv4();
    const width = data.width || 380;
    const height = data.height || 480;

    const result = await db.execute(sql`
      INSERT INTO tiles (id, workspace_id, react_flow_id, tile_type, model, label, position_x, position_y, width, height, message_count, tokens_used, credits_used)
      VALUES (${id}, ${workspaceId}, ${reactFlowId}, ${data.tileType}, ${data.model || null}, ${data.label || null}, ${data.positionX}, ${data.positionY}, ${width}, ${height}, 0, 0, 0)
      RETURNING *
    `);

    return result[0];
  }

  async findByWorkspace(workspaceId: string) {
    const result = await db.execute(sql`
      SELECT * FROM tiles WHERE workspace_id = ${workspaceId} ORDER BY created_at DESC
    `);
    return Array.isArray(result) ? result : [];
  }

  async findById(id: string, workspaceId: string) {
    const result = await db.execute(sql`
      SELECT * FROM tiles WHERE id = ${id} AND workspace_id = ${workspaceId}
    `);
    const rows = Array.isArray(result) ? result : [];
    if (rows.length === 0) {
      throw new NotFoundException('Tile not found');
    }
    return rows[0];
  }

  async update(
    id: string,
    workspaceId: string,
    data: {
      label?: string;
      model?: string;
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
      messageCount?: number;
      tokensUsed?: number;
      creditsUsed?: number;
    },
  ) {
    const setData: Record<string, unknown> = {};
    if (data.label !== undefined) setData.label = data.label;
    if (data.model !== undefined) setData.model = data.model;
    if (data.positionX !== undefined) setData.positionX = data.positionX;
    if (data.positionY !== undefined) setData.positionY = data.positionY;
    if (data.width !== undefined) setData.width = data.width;
    if (data.height !== undefined) setData.height = data.height;
    if (data.messageCount !== undefined) setData.messageCount = data.messageCount;
    if (data.tokensUsed !== undefined) setData.tokensUsed = data.tokensUsed;
    if (data.creditsUsed !== undefined) setData.creditsUsed = data.creditsUsed;

    if (Object.keys(setData).length === 0) {
      return this.findById(id, workspaceId);
    }

    const [tile] = await db
      .update(tiles)
      .set(setData)
      .where(and(eq(tiles.id, id), eq(tiles.workspaceId, workspaceId)))
      .returning();

    if (!tile) {
      throw new NotFoundException('Tile not found');
    }
    return tile;
  }

  async resolveWorkspaceId(tileId: string): Promise<string> {
    const [tile] = await db
      .select({ workspaceId: tiles.workspaceId })
      .from(tiles)
      .where(eq(tiles.id, tileId));
    if (!tile) throw new NotFoundException('Tile not found');
    return tile.workspaceId;
  }

  async delete(id: string, workspaceId: string) {
    const result = await db.execute(sql`
      DELETE FROM tiles WHERE id = ${id} AND workspace_id = ${workspaceId} RETURNING *
    `);
    const rows = Array.isArray(result) ? result : [];
    if (rows.length === 0) {
      throw new NotFoundException('Tile not found');
    }

    await db.execute(sql`DELETE FROM messages WHERE tile_id = ${id}`);

    return { deleted: true };
  }

  async getTileMessages(tileId: string, limit = 50) {
    const result = await db.execute(sql`
      SELECT * FROM messages WHERE tile_id = ${tileId} ORDER BY created_at DESC LIMIT ${limit}
    `);
    return Array.isArray(result) ? result : [];
  }

  async addMessage(
    tileId: string,
    data: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      tokensIn?: number;
      tokensOut?: number;
      model?: string;
      latencyMs?: number;
    },
  ) {
    const id = uuidv4();
    const tokensIn = data.tokensIn || 0;
    const tokensOut = data.tokensOut || 0;

    const result = await db.execute(sql`
      INSERT INTO messages (id, tile_id, role, content, tokens_in, tokens_out, model, latency_ms)
      VALUES (${id}, ${tileId}, ${data.role}, ${data.content}, ${tokensIn}, ${tokensOut}, ${data.model || null}, ${data.latencyMs || null})
      RETURNING *
    `);

    await db.execute(sql`
      UPDATE tiles SET message_count = message_count + 1, tokens_used = tokens_used + ${tokensIn + tokensOut} WHERE id = ${tileId}
    `);

    return result[0];
  }
}