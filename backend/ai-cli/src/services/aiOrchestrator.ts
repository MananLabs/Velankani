import { generateGPTResponse, GPTResponse } from '../models/gpt.js';
import { generateGeminiResponse, GeminiResponse } from '../models/gemini.js';
import { generateClaudeResponse, ClaudeResponse } from '../models/claude.js';
import { Logger } from '../utils/logger.js';

interface OrchestratorResult {
  prompt: string;
  gpt: GPTResponse;
  gemini: GeminiResponse;
  claude: ClaudeResponse;
  totalTime: number;
}

export class AIOrchestrator {
  /**
   * Send a prompt to all three AI models simultaneously.
   *
   * @param prompt        User's input prompt
   * @param systemPrompt  Optional system prompt injected before the user message.
   *                      When omitted, behaviour is identical to before — no
   *                      existing callers are affected.
   */
  static async orchestrate(
    prompt: string,
    systemPrompt?: string
  ): Promise<OrchestratorResult> {
    const startTime = Date.now();

    Logger.info('Starting orchestration for prompt...');

    try {
      // Send requests to all 3 models concurrently
      const [gptResponse, geminiResponse, claudeResponse] = await Promise.all([
        generateGPTResponse(prompt, systemPrompt),
        generateGeminiResponse(prompt, systemPrompt),
        generateClaudeResponse(prompt, systemPrompt),
      ]);

      const totalTime = (Date.now() - startTime) / 1000;

      return {
        prompt,
        gpt: gptResponse,
        gemini: geminiResponse,
        claude: claudeResponse,
        totalTime,
      };
    } catch (error) {
      const totalTime = (Date.now() - startTime) / 1000;
      Logger.error(
        `Orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      return {
        prompt,
        gpt:    { success: false, content: '', responseTime: 0, error: 'Orchestration failed' },
        gemini: { success: false, content: '', responseTime: 0, error: 'Orchestration failed' },
        claude: { success: false, content: '', responseTime: 0, error: 'Orchestration failed' },
        totalTime,
      };
    }
  }

  /**
   * Display orchestration results in terminal — unchanged.
   */
  static displayResults(result: OrchestratorResult): void {
    if (result.gpt.success) {
      Logger.gptResponse(result.gpt.content, result.gpt.responseTime, result.gpt.reasoningTokens);
    } else {
      Logger.errorResponse('GPT', result.gpt.error || 'Unknown error', result.gpt.responseTime);
    }

    if (result.gemini.success) {
      Logger.geminiResponse(result.gemini.content, result.gemini.responseTime, result.gemini.reasoningTokens);
    } else {
      Logger.errorResponse('Gemini', result.gemini.error || 'Unknown error', result.gemini.responseTime);
    }

    if (result.claude.success) {
      Logger.claudeResponse(result.claude.content, result.claude.responseTime, result.claude.reasoningTokens);
    } else {
      Logger.errorResponse('Claude', result.claude.error || 'Unknown error', result.claude.responseTime);
    }

    Logger.info(`Total orchestration time: ${result.totalTime.toFixed(2)}s`);
  }
}
