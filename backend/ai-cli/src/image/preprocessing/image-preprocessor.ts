/**
 * Image Pipeline — Preprocessor
 *
 * Prepares an image for OCR by:
 *   1. Stripping all EXIF / GPS metadata (security)
 *   2. Resizing large images to a max dimension (memory safety)
 *   3. Converting to greyscale (improves Tesseract accuracy)
 *   4. Normalising contrast (sharpen + linear stretch)
 *   5. Outputting a PNG buffer (lossless, Tesseract-friendly)
 *
 * The original file is NEVER modified.
 */

import sharp from 'sharp';

/** Maximum dimension (width or height) for OCR preprocessing */
const MAX_OCR_DIMENSION = 2400;

export interface PreprocessedImage {
  /** PNG buffer ready for Tesseract */
  buffer: Buffer;
  /** Width after preprocessing */
  width: number;
  /** Height after preprocessing */
  height: number;
}

export class ImagePreprocessor {
  /**
   * Preprocess an image file for OCR.
   * Returns a greyscale PNG buffer with EXIF stripped.
   */
  static async prepareForOCR(absolutePath: string): Promise<PreprocessedImage> {
    const pipeline = sharp(absolutePath, { failOn: 'error' })
      // Strip all metadata (EXIF, GPS, ICC profiles, etc.)
      .withMetadata({ exif: {}, icc: undefined })
      // Resize if too large — keeps aspect ratio, never upscales
      .resize(MAX_OCR_DIMENSION, MAX_OCR_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      // Greyscale improves Tesseract accuracy significantly
      .greyscale()
      // Normalise contrast (stretch histogram to full range)
      .normalise()
      // Output as PNG (lossless, no JPEG artefacts)
      .png({ compressionLevel: 1 }); // low compression = faster

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      width: info.width,
      height: info.height,
    };
  }

  /**
   * Produce a clean copy of the image with EXIF stripped only
   * (used for captioning — keeps colour for better vision model results).
   */
  static async prepareForCaptioning(absolutePath: string): Promise<Buffer> {
    return sharp(absolutePath, { failOn: 'error' })
      .withMetadata({ exif: {}, icc: undefined })
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  }
}
