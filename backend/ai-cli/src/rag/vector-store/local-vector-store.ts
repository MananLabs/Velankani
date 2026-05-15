/**
 * RAG — Local Vector Store
 *
 * Persists vector entries as JSON files on the local filesystem.
 * One JSON file per document, stored under:
 *   <cwd>/storage/vectors/<documentId>.json
 *
 * A global metadata index is maintained at:
 *   <cwd>/storage/metadata/index.json
 *
 * Uses only Node built-in fs/promises — no fs-extra JSON helpers needed.
 */

import {
  mkdir,
  writeFile,
  readFile,
  access,
  rm,
} from 'node:fs/promises';
import * as path from 'path';
import { VectorEntry, VectorStoreIndex, DocumentMetadata } from '../types/index.js';
import { Logger } from '../../utils/logger.js';

const STORAGE_ROOT    = path.join(process.cwd(), 'storage');
const VECTORS_DIR     = path.join(STORAGE_ROOT, 'vectors');
const METADATA_DIR    = path.join(STORAGE_ROOT, 'metadata');
const META_INDEX_PATH = path.join(METADATA_DIR, 'index.json');

export interface MetaIndexEntry {
  documentId: string;
  sourcePath: string;
  fileName: string;
  ingestedAt: string;
  totalChunks: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// ── LocalVectorStore ──────────────────────────────────────────────────────────

export class LocalVectorStore {
  // ── Initialisation ──────────────────────────────────────────────────────────

  static async initialize(): Promise<void> {
    await ensureDir(VECTORS_DIR);
    await ensureDir(METADATA_DIR);

    if (!(await pathExists(META_INDEX_PATH))) {
      await writeJson(META_INDEX_PATH, { documents: [] });
    }
  }

  // ── Write ───────────────────────────────────────────────────────────────────

  /**
   * Persist all vector entries for a document.
   * Overwrites any existing index for the same documentId.
   */
  static async saveVectors(
    documentMetadata: DocumentMetadata,
    entries: VectorEntry[]
  ): Promise<void> {
    const index: VectorStoreIndex = {
      documentId: documentMetadata.documentId,
      sourcePath: documentMetadata.sourcePath,
      updatedAt: new Date().toISOString(),
      entries,
    };

    const vectorPath = path.join(VECTORS_DIR, `${documentMetadata.documentId}.json`);
    await writeJson(vectorPath, index);

    await this.upsertMetaIndex({
      documentId: documentMetadata.documentId,
      sourcePath: documentMetadata.sourcePath,
      fileName: documentMetadata.fileName,
      ingestedAt: documentMetadata.ingestedAt,
      totalChunks: documentMetadata.totalChunks,
    });

    Logger.info(`Vectors saved: ${entries.length} entries → ${path.basename(vectorPath)}`);
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  /**
   * Load all vector entries for a given documentId.
   * Returns an empty array if the document has not been indexed.
   */
  static async loadVectors(documentId: string): Promise<VectorEntry[]> {
    const vectorPath = path.join(VECTORS_DIR, `${documentId}.json`);

    if (!(await pathExists(vectorPath))) {
      return [];
    }

    const index = await readJson<VectorStoreIndex>(vectorPath);
    return index.entries;
  }

  /**
   * Load the global metadata index.
   */
  static async loadMetaIndex(): Promise<MetaIndexEntry[]> {
    if (!(await pathExists(META_INDEX_PATH))) return [];
    const data = await readJson<{ documents: MetaIndexEntry[] }>(META_INDEX_PATH);
    return data.documents ?? [];
  }

  /**
   * Check whether a document has already been indexed.
   */
  static async isIndexed(documentId: string): Promise<boolean> {
    const vectorPath = path.join(VECTORS_DIR, `${documentId}.json`);
    return pathExists(vectorPath);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  /**
   * Remove a document's vectors and its entry from the metadata index.
   */
  static async deleteDocument(documentId: string): Promise<void> {
    const vectorPath = path.join(VECTORS_DIR, `${documentId}.json`);
    if (await pathExists(vectorPath)) {
      await rm(vectorPath, { force: true });
    }
    await this.removeFromMetaIndex(documentId);
    Logger.info(`Document removed from vector store: ${documentId}`);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private static async upsertMetaIndex(entry: MetaIndexEntry): Promise<void> {
    const data = await readJson<{ documents: MetaIndexEntry[] }>(META_INDEX_PATH);
    const existing = data.documents.findIndex((d) => d.documentId === entry.documentId);

    if (existing >= 0) {
      data.documents[existing] = entry;
    } else {
      data.documents.push(entry);
    }

    await writeJson(META_INDEX_PATH, data);
  }

  private static async removeFromMetaIndex(documentId: string): Promise<void> {
    if (!(await pathExists(META_INDEX_PATH))) return;
    const data = await readJson<{ documents: MetaIndexEntry[] }>(META_INDEX_PATH);
    data.documents = data.documents.filter((d) => d.documentId !== documentId);
    await writeJson(META_INDEX_PATH, data);
  }
}
