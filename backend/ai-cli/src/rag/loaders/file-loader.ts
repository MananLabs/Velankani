/**
 * RAG — File Loader
 *
 * Validates the file path, resolves the file type, and reads the raw
 * binary buffer.  Large files are read in a streaming fashion so we
 * never hold the entire file in memory as a string at this stage.
 */

import { createReadStream } from 'node:fs';
import { stat, access } from 'node:fs/promises';
import * as path from 'path';
import { Logger } from '../../utils/logger.js';
import { SupportedFileType } from '../types/index.js';

/** Maximum file size we will attempt to process: 100 MB */
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

/** Map of file extensions → SupportedFileType */
const EXTENSION_MAP: Record<string, SupportedFileType> = {
  '.pdf':  'pdf',
  '.txt':  'txt',
  '.docx': 'docx',
  '.md':   'md',
  '.markdown': 'md',
  '.json': 'json',
  '.csv':  'csv',
  '.html': 'html',
  '.htm':  'html',
  '.xml':  'xml',
  // Code files
  '.ts':   'code',
  '.tsx':  'code',
  '.js':   'code',
  '.jsx':  'code',
  '.py':   'code',
  '.java': 'code',
  '.go':   'code',
  '.rs':   'code',
  '.cpp':  'code',
  '.c':    'code',
  '.h':    'code',
  '.cs':   'code',
  '.rb':   'code',
  '.php':  'code',
  '.swift':'code',
  '.kt':   'code',
  '.sh':   'code',
  '.bash': 'code',
  '.yaml': 'code',
  '.yml':  'code',
  '.toml': 'code',
  '.ini':  'code',
  '.env':  'code',
  '.sql':  'code',
};

export interface LoadedFile {
  /** Absolute resolved path */
  absolutePath: string;
  /** Original file name */
  fileName: string;
  /** Detected file type */
  fileType: SupportedFileType;
  /** File size in bytes */
  fileSize: number;
  /** Raw binary buffer — used by parsers */
  buffer: Buffer;
}

export class FileLoader {
  /**
   * Load a file from the given path.
   * Validates existence, size, and type before reading.
   */
  static async load(filePath: string): Promise<LoadedFile> {
    // Strip surrounding quotes that Windows users often include when pasting paths
    const cleanedPath = filePath.replace(/^["']|["']$/g, '').trim();
    const absolutePath = path.resolve(cleanedPath);

    // ── Existence check ──────────────────────────────────────────────────────
    try {
      await access(absolutePath);
    } catch {
      throw new Error(`File not found: ${absolutePath}`);
    }

    // ── Stat ─────────────────────────────────────────────────────────────────
    const stats = await stat(absolutePath);

    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${absolutePath}`);
    }

    if (stats.size === 0) {
      throw new Error(`File is empty: ${absolutePath}`);
    }

    if (stats.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File too large (${(stats.size / 1024 / 1024).toFixed(1)} MB). ` +
        `Maximum allowed: ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`
      );
    }

    // ── Type detection ───────────────────────────────────────────────────────
    const ext = path.extname(absolutePath).toLowerCase();
    const fileType = EXTENSION_MAP[ext];

    if (!fileType) {
      throw new Error(
        `Unsupported file type: "${ext}". ` +
        `Supported: ${Object.keys(EXTENSION_MAP).join(', ')}`
      );
    }

    // ── Read buffer (streaming accumulation) ─────────────────────────────────
    Logger.info(`Reading file: ${path.basename(absolutePath)} (${(stats.size / 1024).toFixed(1)} KB)`);
    const buffer = await FileLoader.readBuffer(absolutePath);

    return {
      absolutePath,
      fileName: path.basename(absolutePath),
      fileType,
      fileSize: stats.size,
      buffer,
    };
  }

  /**
   * Read a file into a Buffer using a stream to avoid blocking the event loop
   * on large files.
   */
  private static readBuffer(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = createReadStream(filePath);

      stream.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Return the list of supported extensions for display purposes.
   */
  static supportedExtensions(): string[] {
    return Object.keys(EXTENSION_MAP);
  }
}
