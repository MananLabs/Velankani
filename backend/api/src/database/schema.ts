// ═══════════════════════════════════════════════════════════
// VEL AI — Complete Database Schema (Neon PostgreSQL + Drizzle)
// ═══════════════════════════════════════════════════════════

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

// ── Enums ──────────────────────────────────────────────────

export const planEnum = pgEnum('plan', [
  'free',
  'pro',
  'pro_byok',
  'teams',
  'enterprise',
]);

export const tileTypeEnum = pgEnum('tile_type', [
  'ai-chat',
  'consensus',
  'terminal',
  'research',
  'docs',
  'slides',
  'website',
  'sheets',
  'cadam',
  'swarm',
  'workflow',
]);

export const roleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);

export const txReasonEnum = pgEnum('tx_reason', [
  'ai_inference',
  'consensus_mode',
  'research_agent',
  'monthly_allocation',
  'top_up',
  'referral',
  'admin_grant',
  'refund',
]);

// ── Users ──────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: varchar('clerk_id', { length: 255 }).unique(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    avatarUrl: text('avatar_url'),
    plan: planEnum('plan').default('free').notNull(),
    creditsRemaining: integer('credits_remaining').default(100).notNull(),
    creditsMonthlyAlloc: integer('credits_monthly_alloc').default(100).notNull(),
    creditsUsedThisMonth: integer('credits_used_this_month').default(0).notNull(),
    byokOpenaiKey: text('byok_openai_key'),
    byokAnthropicKey: text('byok_anthropic_key'),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
    referralCode: varchar('referral_code', { length: 16 }).unique(),
    referredBy: uuid('referred_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    clerkIdx: index('users_clerk_id_idx').on(t.clerkId),
    emailIdx: index('users_email_idx').on(t.email),
  }),
);

// ── Workspaces ─────────────────────────────────────────────

export const workspaces = pgTable(
  'workspaces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).default('Untitled Workspace').notNull(),
    description: text('description'),
    canvasState: jsonb('canvas_state'),
    contextGraph: jsonb('context_graph'),
    templateId: varchar('template_id', { length: 100 }),
    isPublic: boolean('is_public').default(false).notNull(),
    shareToken: varchar('share_token', { length: 64 }).unique(),
    thumbnail: text('thumbnail'),
    tileCount: integer('tile_count').default(0).notNull(),
    lastOpenedAt: timestamp('last_opened_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('workspaces_user_id_idx').on(t.userId),
    shareIdx: index('workspaces_share_token_idx').on(t.shareToken),
    publicIdx: index('workspaces_is_public_idx').on(t.isPublic),
  }),
);

// ── Tiles ──────────────────────────────────────────────────

export const tiles = pgTable(
  'tiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    reactFlowId: varchar('react_flow_id', { length: 100 }).notNull(),
    tileType: tileTypeEnum('tile_type').notNull(),
    model: varchar('model', { length: 100 }),
    label: varchar('label', { length: 255 }),
    messageCount: integer('message_count').default(0).notNull(),
    tokensUsed: integer('tokens_used').default(0).notNull(),
    creditsUsed: integer('credits_used').default(0).notNull(),
    positionX: integer('position_x').default(0),
    positionY: integer('position_y').default(0),
    width: integer('width').default(360),
    height: integer('height').default(480),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index('tiles_workspace_id_idx').on(t.workspaceId),
  }),
);

// ── Messages ───────────────────────────────────────────────

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tileId: uuid('tile_id')
      .notNull()
      .references(() => tiles.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull(),
    content: text('content').notNull(),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    model: varchar('model', { length: 100 }),
    latencyMs: integer('latency_ms'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    tileIdx: index('messages_tile_id_idx').on(t.tileId),
    createdAtIdx: index('messages_created_at_idx').on(t.createdAt),
  }),
);

// ── Credit Transactions ────────────────────────────────────

export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    amount: integer('amount').notNull(),
    reason: txReasonEnum('reason').notNull(),
    modelUsed: varchar('model_used', { length: 100 }),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    tileId: uuid('tile_id'),
    workspaceId: uuid('workspace_id'),
    requestId: varchar('request_id', { length: 64 }),
    stripeEventId: varchar('stripe_event_id', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('credit_tx_user_id_idx').on(t.userId),
    requestIdx: index('credit_tx_request_id_idx').on(t.requestId),
    createdAtIdx: index('credit_tx_created_at_idx').on(t.createdAt),
  }),
);

// ── Subscriptions ──────────────────────────────────────────

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  seatCount: integer('seat_count').default(1),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  trialEnd: timestamp('trial_end'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Usage Events ───────────────────────────────────────────

export const usageEvents = pgTable(
  'usage_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    latencyMs: integer('latency_ms'),
    model: varchar('model', { length: 100 }),
    tileType: tileTypeEnum('tile_type'),
    workspaceId: uuid('workspace_id'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('usage_events_user_id_idx').on(t.userId),
    createdAtIdx: index('usage_events_created_at_idx').on(t.createdAt),
    modelIdx: index('usage_events_model_idx').on(t.model),
  }),
);

// ── Workflow Recordings ────────────────────────────────────

export const workflowRecordings = pgTable('workflow_recordings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tileId: uuid('tile_id')
    .notNull()
    .references(() => tiles.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull(),
  name: varchar('name', { length: 255 }),
  steps: jsonb('steps').notNull(),
  r2Key: text('r2_key'),
  status: varchar('status', { length: 50 }).default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
