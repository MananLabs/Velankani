// ═══════════════════════════════════════════════════════════
// VEL AI — AI Stream DTO
// ═══════════════════════════════════════════════════════════

import { IsString, IsArray, IsOptional, IsInt, Min, Max } from 'class-validator';

export class StreamAIDto {
  @IsString()
  model!: string;

  @IsArray()
  messages!: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;

  @IsString()
  tileId!: string;

  @IsString()
  tileType!: string;

  @IsString()
  workspaceId!: string;

  @IsArray()
  @IsOptional()
  contextSources?: string[];

  @IsInt()
  @Min(256)
  @Max(16384)
  @IsOptional()
  maxTokens?: number;

  @IsString()
  requestId!: string;
}
