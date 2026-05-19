// ═══════════════════════════════════════════════════════════
// VEL AI — Workspace Types
// ═══════════════════════════════════════════════════════════

import type { TileType } from './tiles';

export type Plan = 'free' | 'pro' | 'pro_byok' | 'teams' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: Plan;
  creditsRemaining: number;
  creditsMonthlyAlloc: number;
  creditsUsedThisMonth: number;
  onboardingComplete: boolean;
  referralCode: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  canvasState: CanvasState | null;
  contextGraph: ContextGraph | null;
  templateId: string | null;
  isPublic: boolean;
  shareToken: string | null;
  thumbnail: string | null;
  tileCount: number;
  lastOpenedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
}

export interface CanvasNode {
  id: string;
  type: TileType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  width?: number;
  height?: number;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  type: 'context';
  animated: boolean;
  data?: {
    label: string;
    active: boolean;
    tokenCount?: number;
  };
}

export interface ContextGraph {
  connections: ContextConnection[];
}

export interface ContextConnection {
  sourceId: string;
  targetId: string;
  tokenBudget: number;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tiles: TemplateTile[];
  edges: TemplateEdge[];
}

export interface TemplateTile {
  type: TileType;
  model?: string;
  label: string;
  position: { x: number; y: number };
}

export interface TemplateEdge {
  sourceIndex: number;
  targetIndex: number;
}

export type TxReason =
  | 'ai_inference'
  | 'consensus_mode'
  | 'research_agent'
  | 'monthly_allocation'
  | 'top_up'
  | 'referral'
  | 'admin_grant'
  | 'refund';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: TxReason;
  modelUsed: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  tileId: string | null;
  workspaceId: string | null;
  requestId: string | null;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'completion' | 'error' | 'context' | 'credit' | 'workspace' | 'system';
  message: string;
  tileId?: string;
  model?: string;
  timestamp: number;
}
