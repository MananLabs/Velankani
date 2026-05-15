/**
 * RAG Pipeline — Shared Type Definitions
 * All types are defined here to keep the rest of the modules clean.
 */

// ─── Document ────────────────────────────────────────────────────────────────

export type SupportedFileType =
  | 'pdf'
  | 'txt'
  | 'docx'
  | 'md'
  | 'json'
  | 'csv'
  | 'html'
  | 'xml'
  | 'code'; // .ts, .js, .py, .java, .go, .rs, .cpp, .c, .sh, etc.

export interface DocumentMetadata {
  /** Absolute path to the source file */
  sourcePath: string;
  /** Original file name */
  fileName: string;
  /** Detected file type */
  fileType: SupportedFileType;
  /** File size in bytes */
  fileSize: number;
  /** ISO timestamp when the document was ingested */
  ingestedAt: string;
  /** Total number of chunks produced */
  totalChunks: number;
  /** Unique document ID (hash of sourcePath + ingestedAt) */
  documentId: string;
}

export interface ParsedDocument {
  /** Raw extracted text */
  text: string;
  metadata: DocumentMetadata;
}

// ─── Chunking ────────────────────────────────────────────────────────────────

export interface ChunkMetadata {
  /** Unique chunk ID */
  id: string;
  /** Source document path */
  source: string;
  /** Source document ID */
  documentId: string;
  /** Zero-based index within the document */
  chunkIndex: number;
  /** ISO timestamp when the chunk was created */
  createdAt: string;
  /** Character offset where this chunk starts in the original text */
  startOffset: number;
  /** Character offset where this chunk ends in the original text */
  endOffset: number;
}

export interface TextChunk {
  /** The chunk text content */
  text: string;
  metadata: ChunkMetadata;
}

export interface ChunkingConfig {
  /** Maximum characters per chunk (default: 1000) */
  chunkSize: number;
  /** Overlap characters between consecutive chunks (default: 200) */
  overlap: number;
}

// ─── Embeddings ──────────────────────────────────────────────────────────────

export interface EmbeddingProvider {
  /**
   * Generate a vector embedding for the given text.
   * Returns a float array (the embedding vector).
   */
  generateEmbedding(text: string): Promise<number[]>;
  /** Human-readable provider name for logging */
  readonly providerName: string;
}

// ─── Vector Store ────────────────────────────────────────────────────────────

export interface VectorEntry {
  /** Chunk ID — matches ChunkMetadata.id */
  id: string;
  /** The chunk text */
  text: string;
  /** Embedding vector */
  embedding: number[];
  metadata: ChunkMetadata;
}

export interface VectorStoreIndex {
  /** Document ID this index belongs to */
  documentId: string;
  /** Source file path */
  sourcePath: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** All vector entries for this document */
  entries: VectorEntry[];
}

// ─── Retrieval ───────────────────────────────────────────────────────────────

export interface RetrievalConfig {
  /** Number of top chunks to retrieve (default: 5) */
  topK: number;
  /** Minimum cosine similarity score to include a result (default: 0.0) */
  minScore: number;
}

export interface RetrievalResult {
  chunk: TextChunk;
  /** Cosine similarity score [0, 1] */
  score: number;
}

// ─── Ingestion ───────────────────────────────────────────────────────────────

export interface IngestionResult {
  success: boolean;
  documentId: string;
  documentMetadata?: DocumentMetadata;
  totalChunks: number;
  error?: string;
}

// ─── RAG Session ─────────────────────────────────────────────────────────────

export interface RAGSession {
  /** The active document ID for this session */
  documentId: string;
  /** Source file path */
  sourcePath: string;
  /** Document metadata */
  metadata: DocumentMetadata;
}
