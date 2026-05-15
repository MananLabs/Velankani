/**
 * Image Pipeline — Shared Type Definitions
 */

// ─── Supported formats ────────────────────────────────────────────────────────

export type SupportedImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp';

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export interface ImageMetadata {
  /** Unique image ID (hash of absolutePath + ingestedAt) */
  imageId: string;
  /** Absolute path to the source image */
  sourcePath: string;
  /** Original file name */
  fileName: string;
  /** Detected format */
  format: SupportedImageFormat;
  /** File size in bytes */
  fileSize: number;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** ISO timestamp when the image was ingested */
  ingestedAt: string;
}

// ─── OCR ─────────────────────────────────────────────────────────────────────

export interface OCRResult {
  /** Full extracted text (all blocks joined) */
  text: string;
  /** Average confidence across all detected blocks [0, 1] */
  confidence: number;
  /** Whether any text was detected */
  hasText: boolean;
}

// ─── Captioning ──────────────────────────────────────────────────────────────

export interface CaptionResult {
  /** Semantic description of the image */
  caption: string;
  /** Model used to generate the caption */
  model: string;
}

// ─── Vector entry ─────────────────────────────────────────────────────────────

export interface ImageVectorEntry {
  /** Unique entry ID */
  id: string;
  /** Source image ID */
  imageId: string;
  /** Source image path */
  sourcePath: string;
  /** OCR-extracted text */
  ocrText: string;
  /** Vision-generated semantic caption */
  caption: string;
  /** Combined text used to generate the embedding */
  embeddingText: string;
  /** Embedding vector */
  embedding: number[];
  /** Image metadata */
  metadata: ImageMetadata;
  /** ISO timestamp */
  createdAt: string;
}

export interface ImageVectorIndex {
  imageId: string;
  sourcePath: string;
  updatedAt: string;
  entry: ImageVectorEntry;
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

export interface ImageRetrievalResult {
  entry: ImageVectorEntry;
  /** Cosine similarity score [0, 1] */
  score: number;
}

// ─── Ingestion ────────────────────────────────────────────────────────────────

export interface ImageIngestionResult {
  success: boolean;
  imageId: string;
  metadata?: ImageMetadata;
  ocrText?: string;
  caption?: string;
  error?: string;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface ImageSession {
  imageId: string;
  sourcePath: string;
  metadata: ImageMetadata;
  ocrText: string;
  caption: string;
}
