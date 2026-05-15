/**
 * RAG — Ingestion Pipeline
 *
 * Orchestrates the full document ingestion flow:
 *   Load → Parse → Chunk → Embed → Store
 *
 * Each step is isolated and independently replaceable.
 * Embedding is done in batches with a configurable concurrency limit
 * to avoid hammering the API and to handle large documents gracefully.
 */

import { Logger } from '../../utils/logger.js';
import { FileLoader } from '../loaders/file-loader.js';
import { getParser } from '../parsers/parser-registry.js';
import { TextChunker } from '../chunking/text-chunker.js';
import { EmbeddingProvider, DocumentMetadata, VectorEntry, IngestionResult, ChunkingConfig } from '../types/index.js';
import { LocalVectorStore } from '../vector-store/local-vector-store.js';
import { generateId } from '../utils/hash.js';

/** Maximum concurrent embedding requests */
const EMBEDDING_CONCURRENCY = 5;

export interface IngestionOptions {
  chunking?: Partial<ChunkingConfig>;
  /** If true, re-index even if the document is already stored */
  forceReindex?: boolean;
}

export class IngestionPipeline {
  constructor(private readonly embeddingProvider: EmbeddingProvider) {}

  /**
   * Ingest a document from a local file path.
   */
  async ingest(filePath: string, options: IngestionOptions = {}): Promise<IngestionResult> {
    const startTime = Date.now();

    try {
      // ── Step 1: Load ────────────────────────────────────────────────────────
      Logger.info('Reading document...');
      const loadedFile = await FileLoader.load(filePath);

      // Build document metadata (we need the ID before parsing)
      const ingestedAt = new Date().toISOString();
      const documentId = generateId(loadedFile.absolutePath, ingestedAt);

      // ── Check if already indexed ────────────────────────────────────────────
      if (!options.forceReindex && await LocalVectorStore.isIndexed(documentId)) {
        Logger.info(`Document already indexed: ${loadedFile.fileName}`);
        // Return a lightweight result — caller can still query it
        return {
          success: true,
          documentId,
          totalChunks: 0, // unknown without loading — caller should use metadata index
        };
      }

      // ── Step 2: Parse ───────────────────────────────────────────────────────
      Logger.info('Extracting text...');
      const parser = getParser(loadedFile.fileType);
      const rawText = await parser.parse(loadedFile);

      if (!rawText || rawText.trim().length === 0) {
        return {
          success: false,
          documentId,
          totalChunks: 0,
          error: 'Document contains no extractable text',
        };
      }

      // ── Step 3: Chunk ───────────────────────────────────────────────────────
      Logger.info('Chunking content...');
      const chunker = new TextChunker(options.chunking);

      const documentMetadata: DocumentMetadata = {
        sourcePath: loadedFile.absolutePath,
        fileName: loadedFile.fileName,
        fileType: loadedFile.fileType,
        fileSize: loadedFile.fileSize,
        ingestedAt,
        totalChunks: 0, // filled in after chunking
        documentId,
      };

      const chunks = chunker.chunk(rawText, documentMetadata);
      documentMetadata.totalChunks = chunks.length;

      Logger.info(`Created ${chunks.length} chunks`);

      if (chunks.length === 0) {
        return {
          success: false,
          documentId,
          totalChunks: 0,
          error: 'Chunking produced no output',
        };
      }

      // ── Step 4: Embed (batched) ─────────────────────────────────────────────
      Logger.info('Generating embeddings...');
      await LocalVectorStore.initialize();

      const vectorEntries: VectorEntry[] = [];
      let processed = 0;

      // Process in batches of EMBEDDING_CONCURRENCY
      for (let i = 0; i < chunks.length; i += EMBEDDING_CONCURRENCY) {
        const batch = chunks.slice(i, i + EMBEDDING_CONCURRENCY);

        const batchResults = await Promise.all(
          batch.map(async (chunk) => {
            const embedding = await this.embeddingProvider.generateEmbedding(chunk.text);
            return {
              id: chunk.metadata.id,
              text: chunk.text,
              embedding,
              metadata: chunk.metadata,
            } as VectorEntry;
          })
        );

        vectorEntries.push(...batchResults);
        processed += batch.length;

        // Progress indicator for large documents
        if (chunks.length > 20) {
          const pct = Math.round((processed / chunks.length) * 100);
          process.stdout.write(`\r  Embedding progress: ${pct}% (${processed}/${chunks.length})`);
        }
      }

      if (chunks.length > 20) {
        process.stdout.write('\n');
      }

      // ── Step 5: Store ───────────────────────────────────────────────────────
      Logger.info('Saving vectors locally...');
      await LocalVectorStore.saveVectors(documentMetadata, vectorEntries);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      Logger.info(`Document indexed in ${elapsed}s`);

      return {
        success: true,
        documentId,
        documentMetadata,
        totalChunks: chunks.length,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Logger.error(`Ingestion failed: ${msg}`);
      return {
        success: false,
        documentId: '',
        totalChunks: 0,
        error: msg,
      };
    }
  }
}
