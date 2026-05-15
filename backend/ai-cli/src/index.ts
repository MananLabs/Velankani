import chalk from 'chalk';
import { config, validateConfig } from './config/env.js';
import { Terminal } from './utils/terminal.js';
import { Logger } from './utils/logger.js';
import { AIOrchestrator } from './services/aiOrchestrator.js';
import { VoiceInputOrchestrator } from './voice/voice-input.js';
import { SarvamSTT } from './voice/sarvam-stt.js';
import { RAGOrchestrator } from './rag/rag-orchestrator.js';
import { ImageOrchestrator } from './image/image-orchestrator.js';
import { WebSearchOrchestrator } from './web-search/web-search-orchestrator.js';

async function main(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Initialize Sarvam STT with API key
    const sarvamApiKey = process.env.SARVAM_API_KEY;
    if (sarvamApiKey) {
      SarvamSTT.initialize(sarvamApiKey);
    }

    // Display welcome message
    Terminal.displayWelcome();

    // Select input mode (text, voice, or document)
    const modeSelection = await VoiceInputOrchestrator.selectInputMode();
    const selectedMode = modeSelection.mode;

    // ── Document / RAG mode ───────────────────────────────────────────────────
    if (selectedMode === 'document') {
      await RAGOrchestrator.run();
      return;
    }

    // ── Image / Multimodal mode ───────────────────────────────────────────────
    if (selectedMode === 'image') {
      await ImageOrchestrator.run();
      return;
    }

    // ── Web Search mode ───────────────────────────────────────────────────────
    if (selectedMode === 'web-search') {
      await WebSearchOrchestrator.run();
      return;
    }

    // Main CLI loop
    while (true) {
      let userInput: string;

      if (selectedMode === 'voice') {
        // Voice input flow
        userInput = await VoiceInputOrchestrator.getVoiceInput();

        if (!userInput) {
          Logger.warn('Failed to get voice input. Try again.');
          continue;
        }
      } else {
        // Text input flow (existing implementation)
        userInput = await Terminal.promptUser();
      }

      // Check for exit command
      if (
        userInput.toLowerCase() === 'exit' ||
        userInput.toLowerCase() === 'quit'
      ) {
        console.log(chalk.cyan('Goodbye! 👋'));
        Terminal.close();
        break;
      }

      // Skip empty input
      if (!userInput.trim()) {
        continue;
      }

      // Show loading state
      Terminal.showLoading(['GPT', 'Gemini', 'Claude']);

      // Orchestrate AI calls (existing orchestration - unchanged)
      const result = await AIOrchestrator.orchestrate(userInput);

      // Display results (existing implementation - unchanged)
      AIOrchestrator.displayResults(result);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    Logger.error(errorMessage);
    console.log(chalk.red('\nFailed to start VEL AI CLI'));
    process.exit(1);
  }
}

// Run the main function
main();
