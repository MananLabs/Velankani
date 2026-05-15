/**
 * RAG — CLI Orchestrator
 *
 * Drives the "Via Document" CLI flow:
 *   1. Prompt user for a file path
 *   2. Run the ingestion pipeline (load → parse → chunk → embed → store)
 *   3. Loop: ask user for a question
 *   4. Retrieve relevant chunks
 *   5. Build augmented prompt
 *   6. Hand off to the existing AIOrchestrator (UNCHANGED)
 *
 * This class is the ONLY integration point between the RAG system and
 * the rest of the application.  It does NOT modify any existing module.
 */

import chalk from 'chalk';
import * as path from 'path';
import { Terminal } from '../utils/terminal.js';
import { Logger } from '../utils/logger.js';
import { AIOrchestrator } from '../services/aiOrchestrator.js';
import { IngestionPipeline } from './ingestion/ingestion-pipeline.js';
import { Retriever } from './retrieval/retriever.js';
import { ContextInjector } from './prompt/context-injector.js';
import { createEmbeddingProvider } from './embeddings/embedding-factory.js';
import { RAGSession } from './types/index.js';

export class RAGOrchestrator {
  /**
   * Entry point for the "Via Document" mode.
   * Returns when the user types "exit" or "quit".
   */
  static async run(): Promise<void> {
    // ── Initialise shared embedding provider ──────────────────────────────────
    let embeddingProvider;
    try {
      embeddingProvider = createEmbeddingProvider();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Logger.error(`Cannot start document mode: ${msg}`);
      return;
    }

    const ingestionPipeline = new IngestionPipeline(embeddingProvider);
    const retriever = new Retriever(embeddingProvider, { topK: 5, minScore: 0.0 });

    // ── Step 1: Get file path ─────────────────────────────────────────────────
    const filePath = await RAGOrchestrator.promptFilePath();

    if (!filePath) {
      Logger.warn('No file path provided. Returning to main menu.');
      return;
    }

    // ── Step 2: Ingest document ───────────────────────────────────────────────
    console.log();
    const ingestionResult = await ingestionPipeline.ingest(filePath);

    if (!ingestionResult.success) {
      Logger.error(`Failed to index document: ${ingestionResult.error}`);
      return;
    }

    const session: RAGSession = {
      documentId: ingestionResult.documentId,
      sourcePath: path.resolve(filePath),
      metadata: ingestionResult.documentMetadata ?? {
        sourcePath: path.resolve(filePath),
        fileName: path.basename(filePath),
        fileType: 'txt',
        fileSize: 0,
        ingestedAt: new Date().toISOString(),
        totalChunks: ingestionResult.totalChunks,
        documentId: ingestionResult.documentId,
      },
    };

    console.log();
    console.log(chalk.green('═'.repeat(50)));
    Logger.success(`Document indexed successfully`);
    if (ingestionResult.totalChunks > 0) {
      Logger.info(`Chunks: ${ingestionResult.totalChunks}`);
    }
    Logger.info(`File: ${session.metadata.fileName}`);
    console.log(chalk.green('═'.repeat(50)));
    console.log();
    console.log(chalk.gray('  Type your question about the document.'));
    console.log(chalk.gray('  Type "exit" or "quit" to stop.'));
    console.log();

    // ── Step 3: Question-answer loop ──────────────────────────────────────────
    while (true) {
      const query = await RAGOrchestrator.promptQuestion();

      if (!query) continue;

      if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
        console.log(chalk.cyan('Goodbye! 👋'));
        Terminal.close();
        break;
      }

      // ── Step 4: Retrieve relevant chunks ─────────────────────────────────
      let retrievalResults;
      try {
        retrievalResults = await retriever.retrieve(query, session.documentId);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        Logger.error(`Retrieval failed: ${msg}`);
        continue;
      }

      // ── Step 5: Build augmented prompt ────────────────────────────────────
      const augmentedPrompt = ContextInjector.buildAugmentedPrompt(
        query,
        retrievalResults,
        session.metadata.fileName
      );

      // ── Step 6: Hand off to existing orchestration (UNCHANGED) ───────────
      Logger.info('Sending context to agents...');
      Terminal.showLoading(['GPT', 'Gemini', 'Claude']);

      const result = await AIOrchestrator.orchestrate(augmentedPrompt);
      AIOrchestrator.displayResults(result);
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private static promptFilePath(): Promise<string> {
    return new Promise((resolve) => {
      console.log('\n' + chalk.cyan('─'.repeat(50)));
      Terminal.rl.question(
        chalk.cyan('  Enter Document Path: '),
        (answer) => {
          // Strip surrounding quotes (common when pasting Windows paths)
          const cleaned = answer.trim().replace(/^["']|["']$/g, '').trim();
          resolve(cleaned);
        }
      );
    });
  }

  private static promptQuestion(): Promise<string> {
    return new Promise((resolve) => {
      Terminal.rl.question(
        chalk.cyan('\n  Ask Question About Document: '),
        (answer) => resolve(answer.trim())
      );
    });
  }
}
