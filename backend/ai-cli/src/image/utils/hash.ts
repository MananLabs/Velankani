/**
 * Image Pipeline Utilities — ID generation
 * Reuses the same SHA-256 approach as the RAG pipeline.
 */

import { createHash } from 'node:crypto';

export function generateImageId(...parts: string[]): string {
  return createHash('sha256')
    .update(parts.join('::'))
    .digest('hex')
    .slice(0, 16);
}
