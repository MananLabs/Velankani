/**
 * RAG Utilities — Hashing
 * Uses Node's built-in crypto module — no external dependency.
 */

import { createHash } from 'node:crypto';

/**
 * Generate a short deterministic ID from one or more strings.
 * Returns the first 16 hex characters of a SHA-256 digest.
 */
export function generateId(...parts: string[]): string {
  return createHash('sha256')
    .update(parts.join('::'))
    .digest('hex')
    .slice(0, 16);
}
