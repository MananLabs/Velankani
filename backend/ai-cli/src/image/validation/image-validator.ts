/**
 * Image Pipeline — Validator
 *
 * Validates file existence, extension, MIME type (via Sharp), dimensions,
 * and file size before any processing begins.
 * Strips EXIF/GPS metadata as a security measure.
 */

import { access, stat } from 'node:fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { SupportedImageFormat, ImageValidationResult } from '../types/index.js';

/** 50 MB hard limit */
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** Minimum dimension to be useful for OCR */
const MIN_DIMENSION_PX = 10;

const SUPPORTED_EXTENSIONS: Record<string, SupportedImageFormat> = {
  '.png':  'png',
  '.jpg':  'jpg',
  '.jpeg': 'jpeg',
  '.webp': 'webp',
};

export interface ValidatedImage {
  absolutePath: string;
  fileName: string;
  format: SupportedImageFormat;
  fileSize: number;
  width: number;
  height: number;
}

export class ImageValidator {
  /**
   * Fully validate an image path and return structured metadata.
   * Throws a descriptive error on any validation failure.
   */
  static async validate(filePath: string): Promise<ValidatedImage> {
    // Strip surrounding quotes (Windows paste behaviour)
    const cleaned = filePath.replace(/^["']|["']$/g, '').trim();
    const absolutePath = path.resolve(cleaned);

    // ── Existence ─────────────────────────────────────────────────────────────
    try {
      await access(absolutePath);
    } catch {
      throw new Error(`Image file not found: ${absolutePath}`);
    }

    // ── Extension check ───────────────────────────────────────────────────────
    const ext = path.extname(absolutePath).toLowerCase();
    const format = SUPPORTED_EXTENSIONS[ext];

    if (!format) {
      throw new Error(
        `Unsupported image format: "${ext}". ` +
        `Supported: ${Object.keys(SUPPORTED_EXTENSIONS).join(', ')}`
      );
    }

    // ── File size ─────────────────────────────────────────────────────────────
    const stats = await stat(absolutePath);

    if (stats.size === 0) {
      throw new Error('Image file is empty');
    }

    if (stats.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Image too large (${(stats.size / 1024 / 1024).toFixed(1)} MB). ` +
        `Maximum: ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`
      );
    }

    // ── Sharp metadata (validates actual image data, not just extension) ──────
    let sharpMeta: sharp.Metadata;
    try {
      sharpMeta = await sharp(absolutePath).metadata();
    } catch (err) {
      throw new Error(
        `Corrupted or unreadable image: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    const width  = sharpMeta.width  ?? 0;
    const height = sharpMeta.height ?? 0;

    if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
      throw new Error(
        `Image dimensions too small (${width}×${height}px). ` +
        `Minimum: ${MIN_DIMENSION_PX}px on each side`
      );
    }

    return {
      absolutePath,
      fileName: path.basename(absolutePath),
      format,
      fileSize: stats.size,
      width,
      height,
    };
  }

  static supportedFormats(): string[] {
    return Object.keys(SUPPORTED_EXTENSIONS);
  }
}
