/**
 * Image Pipeline — Ingestion Pipeline
 *
 * Orchestrates the full one-time image processing flow:
 *   Validate → Preprocess → OCR → Caption → Embed → Store
 *
 * The image is sent to the vision API EXACTLY ONCE.
 * All results are stored locally and reused for every future query.
 */

import { Logger } from '../../utils/logger.js';
import { ImageValidator } from '../validation/image-validator.js';
import { ImagePreprocessor } from '../preprocessing/image-preprocessor.js';
import { TesseractOCR } from '../ocr/tesseract-ocr.js';
import { VisionCaptioner } from '../captioning/vision-captioner.js';
import { ImageVectorStore } from '../vector-store/image-vector-store.js';
import { buildEmbeddingText } from '../embeddings/image-embedding-factory.js';
import { EmbeddingProvider } from '../../rag/types/index.js';
import { ImageIngestionResult, ImageMetadata, ImageVectorEntry } from '../types/index.js';
import { generateImageId } from '../utils/hash.js';

export class ImageIngestionPipeline {
  private readonly captioner: VisionCaptioner;

  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    apiKey: string
  ) {
    this.captioner = new VisionCaptioner(apiKey);
  }

  async ingest(filePath: string, forceReindex = false): Promise<ImageIngestionResult> {
    const startTime = Date.now();

    try {
      // ── Step 1: Validate ────────────────────────────────────────────────────
      Logger.info('Validating image...');
      const validated = await ImageValidator.validate(filePath);

      const ingestedAt = new Date().toISOString();
      const imageId = generateImageId(validated.absolutePath, ingestedAt);

      // ── Check if already indexed ────────────────────────────────────────────
      await ImageVectorStore.initialize();

      if (!forceReindex && await ImageVectorStore.isIndexed(imageId)) {
        Logger.info(`Image already indexed: ${validated.fileName}`);
        const existing = await ImageVectorStore.loadVector(imageId);
        return {
          success: true,
          imageId,
          metadata: existing?.metadata,
          ocrText: existing?.ocrText ?? '',
          caption: existing?.caption ?? '',
        };
      }

      const metadata: ImageMetadata = {
        imageId,
        sourcePath: validated.absolutePath,
        fileName: validated.fileName,
        format: validated.format,
        fileSize: validated.fileSize,
        width: validated.width,
        height: validated.height,
        ingestedAt,
      };

      // ── Step 2: Preprocess for OCR ──────────────────────────────────────────
      Logger.info('Preprocessing image...');
      const [ocrBuffer, captionBuffer] = await Promise.all([
        ImagePreprocessor.prepareForOCR(validated.absolutePath),
        ImagePreprocessor.prepareForCaptioning(validated.absolutePath),
      ]);

      // ── Step 3: OCR ─────────────────────────────────────────────────────────
      Logger.info('Running OCR...');
      const ocrResult = await TesseractOCR.extract(ocrBuffer.buffer);

      if (ocrResult.hasText) {
        Logger.info(
          `OCR complete: ${ocrResult.text.length} chars ` +
          `(confidence: ${(ocrResult.confidence * 100).toFixed(0)}%)`
        );
      } else {
        Logger.info('OCR: no text detected in image');
      }

      // ── Step 4: Vision caption (ONE TIME ONLY) ──────────────────────────────
      Logger.info('Generating semantic caption...');
      const captionResult = await this.captioner.caption(captionBuffer);
      Logger.info(`Caption generated via ${captionResult.model}`);

      // ── Step 5: Embed ───────────────────────────────────────────────────────
      Logger.info('Generating embeddings...');
      const embeddingText = buildEmbeddingText(ocrResult.text, captionResult.caption);
      const embedding = await this.embeddingProvider.generateEmbedding(embeddingText);

      // ── Step 6: Store ───────────────────────────────────────────────────────
      Logger.info('Saving vectors locally...');
      const vectorEntry: ImageVectorEntry = {
        id: imageId,
        imageId,
        sourcePath: validated.absolutePath,
        ocrText: ocrResult.text,
        caption: captionResult.caption,
        embeddingText,
        embedding,
        metadata,
        createdAt: ingestedAt,
      };

      await ImageVectorStore.saveVector(vectorEntry);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      Logger.info(`Image indexed in ${elapsed}s`);

      return {
        success: true,
        imageId,
        metadata,
        ocrText: ocrResult.text,
        caption: captionResult.caption,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Logger.error(`Image ingestion failed: ${msg}`);
      return { success: false, imageId: '', error: msg };
    }
  }
}
