/**
 * Web Search Pipeline — Type Definitions
 *
 * Agent-native web search: no external search APIs.
 * Models receive a specialised system prompt that instructs them to
 * behave as web-aware AI assistants using their own knowledge.
 */

// ─── Per-model system prompt config ──────────────────────────────────────────

export type WebSearchModel = 'gpt' | 'gemini' | 'claude';

/**
 * Model-specific system prompt hints.
 * Each model has slightly different strengths for web-style responses.
 */
export interface ModelWebSearchHint {
  /** Additional instruction appended to the shared system prompt */
  additionalInstruction: string;
}

// ─── Web search request ───────────────────────────────────────────────────────

export interface WebSearchRequest {
  /** The user's raw search query */
  query: string;
  /** ISO timestamp when the request was made */
  requestedAt: string;
}

// ─── Augmented prompt result ──────────────────────────────────────────────────

export interface AugmentedWebPrompt {
  /** The fully assembled prompt string ready for the orchestrator */
  prompt: string;
  /** The original query (preserved for display) */
  query: string;
}
