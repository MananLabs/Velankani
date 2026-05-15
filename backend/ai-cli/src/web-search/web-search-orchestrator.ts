/**
 * Web Search — CLI Orchestrator (Agent-Native)
 *
 * Drives the "Via Web Search" CLI flow using prompt engineering only.
 * No external search APIs. No web scraping. No Tavily.
 *
 * Flow:
 *   1. Prompt user for a search query
 *   2. Build model-specific web-search system prompts
 *   3. Pass query + system prompts to existing AIOrchestrator (UNCHANGED)
 *   4. Each model responds in web-search assistant mode
 *   5. Loop for follow-up queries
 *
 * The ONLY change to the existing pipeline is the optional systemPrompt
 * parameter added to AIOrchestrator.orchestrate() — all other modes
 * continue to call it without a system prompt, behaviour identical.
 */

import chalk from 'chalk';
import { Terminal } from '../utils/terminal.js';
import { Logger } from '../utils/logger.js';
import { AIOrchestrator } from '../services/aiOrchestrator.js';
import { WebSystemPromptBuilder } from './prompt/web-system-prompt.js';

export class WebSearchOrchestrator {
  /**
   * Entry point for the "Via Web Search" mode.
   */
  static async run(): Promise<void> {
    console.log();
    console.log(chalk.cyan('═'.repeat(50)));
    console.log(chalk.cyan('  WEB SEARCH MODE'));
    console.log(chalk.cyan('  Powered by GPT · Gemini · Claude'));
    console.log(chalk.cyan('═'.repeat(50)));
    console.log(chalk.gray('  Models will respond in web-search assistant mode.'));
    console.log(chalk.gray('  Type your query and press Enter.'));
    console.log(chalk.gray('  Type "exit" or "quit" to stop.'));
    console.log(chalk.cyan('═'.repeat(50)));
    console.log();

    while (true) {
      const query = await WebSearchOrchestrator.promptQuery();

      if (!query) continue;

      if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
        console.log(chalk.cyan('Goodbye! 👋'));
        Terminal.close();
        break;
      }

      // ── Build the shared web-search system prompt ─────────────────────────
      // All three models receive the same base behaviour instruction.
      // The query itself is the user message — system prompt sets the mode.
      const systemPrompt = WebSystemPromptBuilder.buildGeneric(query);

      // ── Hand off to existing orchestration with system prompt ─────────────
      // The query is passed as the user message.
      // systemPrompt is the new optional parameter — existing modes pass nothing.
      Logger.info('Sending to agents in web-search mode...');
      Terminal.showLoading(['GPT', 'Gemini', 'Claude']);

      const result = await AIOrchestrator.orchestrate(query, systemPrompt);
      AIOrchestrator.displayResults(result);

      console.log();
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private static promptQuery(): Promise<string> {
    return new Promise((resolve) => {
      Terminal.rl.question(
        chalk.cyan('  Enter Search Query: '),
        (answer) => resolve(answer.trim())
      );
    });
  }
}
