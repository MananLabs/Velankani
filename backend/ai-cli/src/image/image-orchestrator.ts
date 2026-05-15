/**
 * Image Pipeline — CLI Orchestrator
 *
 * Drives the "Via Image" CLI flow:
 *   1. Prompt user for image path
 *   2. Run ingestion pipeline (validate → preprocess → OCR → caption → embed → store)
 *   3. Loop: ask user for a question
 *   4. Retrieve relevant image context
 *   5. Build augmented prompt
 *   6. Hand off to existing AIOrchestrator (UNCHANGED)
 *
 * This is the ONLY integration point between the image pipeline and index.ts.
 */

import chalk from 'chalk';
import { Terminal } from '../utils/terminal.js';
import { Logger } from '../utils/logger.js';
import { AIOrchestrator } from '../services/aiOrchestrator.js';
import { ImageIngestionPipeline } from './ingestion/image-ingestion-pipeline.js';
import { ImageRetriever } from './retrieval/image-retriever.js';
import { ImageContextInjector } from './prompt/image-context-injector.js';
import { createImageEmbeddingProvider } from './embeddings/image-embedding-factory.js';
import { ImageSession } from './types/index.js';

export class ImageOrchestrator {
  /**
   * Entry point for the "Via Image" mode.
   */
  static async run(): Promise<void> {
    // ── Initialise providers ──────────────────────────────────────────────────
    let embeddingProvider;
    try {
      embeddingProvider = createImageEmbeddingProvider();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Logger.error(`Cannot start image mode: ${msg}`);
      return;
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY_GPT ||
      process.env.OPENROUTER_API_KEY ||
      '';

    if (!apiKey) {
      Logger.error('No API key found. Set OPENROUTER_API_KEY_GPT in .env');
      return;
    }

    const pipeline  = new ImageIngestionPipeline(embeddingProvider, apiKey);
    const retriever = new ImageRetriever(embeddingProvider, { topK: 5, minScore: 0.0 });

    // ── Step 1: Get image path ────────────────────────────────────────────────
    const imagePath = await ImageOrchestrator.promptImagePath();

    if (!imagePath) {
      Logger.warn('No image path provided. Returning to main menu.');
      return;
    }

    // ── Step 2: Ingest image ──────────────────────────────────────────────────
    console.log();
    const result = await pipeline.ingest(imagePath);

    if (!result.success || !result.metadata) {
      Logger.error(`Failed to index image: ${result.error}`);
      return;
    }

    const session: ImageSession = {
      imageId:    result.imageId,
      sourcePath: result.metadata.sourcePath,
      metadata:   result.metadata,
      ocrText:    result.ocrText ?? '',
      caption:    result.caption ?? '',
    };

    // ── Show ingestion summary ────────────────────────────────────────────────
    console.log();
    console.log(chalk.green('═'.repeat(50)));
    Logger.success('Image indexed successfully');
    Logger.info(`File:       ${session.metadata.fileName}`);
    Logger.info(`Dimensions: ${session.metadata.width}×${session.metadata.height}px`);

    if (session.caption) {
      console.log(chalk.gray(`\n  Caption: ${session.caption.slice(0, 120)}${session.caption.length > 120 ? '…' : ''}`));
    }
    if (session.ocrText) {
      const preview = session.ocrText.replace(/\n/g, ' ').slice(0, 100);
      console.log(chalk.gray(`  OCR:     ${preview}${session.ocrText.length > 100 ? '…' : ''}`));
    }

    console.log(chalk.green('═'.repeat(50)));
    console.log();
    console.log(chalk.gray('  Type your question about the image.'));
    console.log(chalk.gray('  Type "exit" or "quit" to stop.'));
    console.log();

    // ── Step 3: Question-answer loop ──────────────────────────────────────────
    while (true) {
      const query = await ImageOrchestrator.promptQuestion();

      if (!query) continue;

      if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
        console.log(chalk.cyan('Goodbye! 👋'));
        Terminal.close();
        break;
      }

      // ── Retrieve ────────────────────────────────────────────────────────────
      let retrievalResults;
      try {
        retrievalResults = await retriever.retrieve(query, session.imageId);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        Logger.error(`Retrieval failed: ${msg}`);
        continue;
      }

      // ── Augment prompt ──────────────────────────────────────────────────────
      const augmentedPrompt = ImageContextInjector.buildAugmentedPrompt(
        query,
        retrievalResults
      );

      // ── Hand off to existing orchestration (UNCHANGED) ──────────────────────
      Logger.info('Sending context to agents...');
      Terminal.showLoading(['GPT', 'Gemini', 'Claude']);

      const orchestrationResult = await AIOrchestrator.orchestrate(augmentedPrompt);
      AIOrchestrator.displayResults(orchestrationResult);
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private static promptImagePath(): Promise<string> {
    return new Promise((resolve) => {
      console.log('\n' + chalk.cyan('─'.repeat(50)));
      Terminal.rl.question(
        chalk.cyan('  Enter Image Path: '),
        (answer) => {
          const cleaned = answer.trim().replace(/^["']|["']$/g, '').trim();
          resolve(cleaned);
        }
      );
    });
  }

  private static promptQuestion(): Promise<string> {
    return new Promise((resolve) => {
      Terminal.rl.question(
        chalk.cyan('\n  Ask Question About Image: '),
        (answer) => resolve(answer.trim())
      );
    });
  }
}
