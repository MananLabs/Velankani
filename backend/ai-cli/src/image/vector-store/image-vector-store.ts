/**
 * Image Pipeline — Local Vector Store
 *
 * Stores one JSON file per image under:
 *   <cwd>/storage/image-vectors/<imageId>.json
 *
 * Global metadata index at:
 *   <cwd>/storage/image-metadata/index.json
 *
 * Uses only Node built-in fs/promises — no external dependencies.
 * Designed to be swappable with pgvector / Pinecone / Qdrant later.
 */

import { mkdir, writeFile, readFile, access, rm } from 'node:fs/promises';
import * as path from 'path';
import { ImageVectorEntry, ImageVectorIndex, ImageMetadata } from '../types/index.js';
import { Logger } from '../../utils/logger.js';

const STORAGE_ROOT      = path.join(process.cwd(), 'storage');
const IMAGE_VECTORS_DIR = path.join(STORAGE_ROOT, 'image-vectors');
const IMAGE_META_DIR    = path.join(STORAGE_ROOT, 'image-metadata');
const META_INDEX_PATH   = path.join(IMAGE_META_DIR, 'index.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function pathExists(p: string): Promise<boolean> {
  try { await access(p); return true; } catch { return false; }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf-8')) as T;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export interface ImageMetaIndexEntry {
  imageId: string;
  sourcePath: string;
  fileName: string;
  ingestedAt: string;
  format: string;
  width: number;
  height: number;
}

export class ImageVectorStore {
  static async initialize(): Promise<void> {
    await ensureDir(IMAGE_VECTORS_DIR);
    await ensureDir(IMAGE_META_DIR);

    if (!(await pathExists(META_INDEX_PATH))) {
      await writeJson(META_INDEX_PATH, { images: [] });
    }
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  static async saveVector(entry: ImageVectorEntry): Promise<void> {
    const index: ImageVectorIndex = {
      imageId: entry.imageId,
      sourcePath: entry.sourcePath,
      updatedAt: new Date().toISOString(),
      entry,
    };

    const vectorPath = path.join(IMAGE_VECTORS_DIR, `${entry.imageId}.json`);
    await writeJson(vectorPath, index);

    await ImageVectorStore.upsertMetaIndex({
      imageId:    entry.imageId,
      sourcePath: entry.sourcePath,
      fileName:   entry.metadata.fileName,
      ingestedAt: entry.metadata.ingestedAt,
      format:     entry.metadata.format,
      width:      entry.metadata.width,
      height:     entry.metadata.height,
    });

    Logger.info(`Image vector saved → ${path.basename(vectorPath)}`);
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  static async loadVector(imageId: string): Promise<ImageVectorEntry | null> {
    const vectorPath = path.join(IMAGE_VECTORS_DIR, `${imageId}.json`);
    if (!(await pathExists(vectorPath))) return null;
    const index = await readJson<ImageVectorIndex>(vectorPath);
    return index.entry;
  }

  static async loadAllVectors(): Promise<ImageVectorEntry[]> {
    const metaIndex = await ImageVectorStore.loadMetaIndex();
    const entries: ImageVectorEntry[] = [];

    for (const meta of metaIndex) {
      const entry = await ImageVectorStore.loadVector(meta.imageId);
      if (entry) entries.push(entry);
    }

    return entries;
  }

  static async loadMetaIndex(): Promise<ImageMetaIndexEntry[]> {
    if (!(await pathExists(META_INDEX_PATH))) return [];
    const data = await readJson<{ images: ImageMetaIndexEntry[] }>(META_INDEX_PATH);
    return data.images ?? [];
  }

  static async isIndexed(imageId: string): Promise<boolean> {
    return pathExists(path.join(IMAGE_VECTORS_DIR, `${imageId}.json`));
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  static async deleteImage(imageId: string): Promise<void> {
    const vectorPath = path.join(IMAGE_VECTORS_DIR, `${imageId}.json`);
    if (await pathExists(vectorPath)) {
      await rm(vectorPath, { force: true });
    }
    await ImageVectorStore.removeFromMetaIndex(imageId);
    Logger.info(`Image removed from vector store: ${imageId}`);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private static async upsertMetaIndex(entry: ImageMetaIndexEntry): Promise<void> {
    const data = await readJson<{ images: ImageMetaIndexEntry[] }>(META_INDEX_PATH);
    const idx = data.images.findIndex((i) => i.imageId === entry.imageId);
    if (idx >= 0) data.images[idx] = entry;
    else data.images.push(entry);
    await writeJson(META_INDEX_PATH, data);
  }

  private static async removeFromMetaIndex(imageId: string): Promise<void> {
    if (!(await pathExists(META_INDEX_PATH))) return;
    const data = await readJson<{ images: ImageMetaIndexEntry[] }>(META_INDEX_PATH);
    data.images = data.images.filter((i) => i.imageId !== imageId);
    await writeJson(META_INDEX_PATH, data);
  }
}
