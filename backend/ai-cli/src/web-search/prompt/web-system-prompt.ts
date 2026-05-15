/**
 * Web Search — System Prompt Builder
 *
 * Constructs the specialised system prompt that instructs each AI model
 * to behave as a web-aware search assistant.
 *
 * Each model gets:
 *   1. A shared base system prompt (web-search mode behaviour)
 *   2. A model-specific addendum tuned to that model's strengths
 *   3. The user's query appended at the end
 *
 * No external APIs. No scraping. No fake citations.
 * Models use their own knowledge + web-aware reasoning.
 */

import { WebSearchModel } from '../types/index.js';

// ─── Shared base prompt ───────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are operating in WEB SEARCH MODE.

This is NOT a normal conversational request.
The user is asking for a web-style information retrieval response, similar to a modern AI-powered search engine.

YOUR RESPONSIBILITIES:
- Provide information in a web-search style format: structured, factual, and informative
- Prioritise recent and current information from your latest available knowledge
- Focus on facts, figures, announcements, and developments relevant to the query
- Structure your answer like an AI-powered search assistant (not a chatbot)
- Clearly indicate when information may be outdated or uncertain
- Do NOT fabricate URLs, citations, or sources you cannot verify
- If you are uncertain about recency, say so explicitly
- Include recent trends, announcements, or developments if relevant to the query
- Be concise but thorough — aim for a search-result summary, not an essay

RESPONSE FORMAT:
- Lead with the most important/current information
- Use bullet points or short paragraphs for clarity
- If applicable, mention approximate timeframes (e.g. "As of early 2025...")
- End with a brief note on knowledge limitations if relevant

DO NOT behave like a casual chatbot. Behave like a knowledgeable, up-to-date AI search assistant.`;

// ─── Model-specific addenda ───────────────────────────────────────────────────

const MODEL_HINTS: Record<WebSearchModel, string> = {
  gpt: `
Additional instruction for this response:
You have strong general knowledge and reasoning. Synthesise information clearly and provide well-structured search-style summaries. If your training data has a cutoff, acknowledge it briefly.`,

  gemini: `
Additional instruction for this response:
You have access to recent information and strong factual recall. Prioritise the most current data available to you. Provide precise, up-to-date answers with clear structure.`,

  claude: `
Additional instruction for this response:
You excel at nuanced summarisation. Provide a balanced, well-reasoned search summary. Clearly distinguish between well-established facts and more recent or uncertain developments.`,
};

// ─── Builder ──────────────────────────────────────────────────────────────────

export class WebSystemPromptBuilder {
  /**
   * Build the full prompt for a specific model.
   *
   * @param query  The user's search query
   * @param model  Which model this prompt is for
   */
  static build(query: string, model: WebSearchModel): string {
    const hint = MODEL_HINTS[model];

    return [
      BASE_SYSTEM_PROMPT,
      hint,
      '',
      '─'.repeat(40),
      `USER SEARCH QUERY: ${query}`,
    ].join('\n');
  }

  /**
   * Build a generic prompt (no model-specific hint).
   * Used when the model is unknown or for testing.
   */
  static buildGeneric(query: string): string {
    return [
      BASE_SYSTEM_PROMPT,
      '',
      '─'.repeat(40),
      `USER SEARCH QUERY: ${query}`,
    ].join('\n');
  }
}
