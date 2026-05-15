/**
 * RAG — Parser Registry
 *
 * Maps SupportedFileType → the correct BaseParser implementation.
 * Adding support for a new format only requires registering it here.
 */

import { SupportedFileType } from '../types/index.js';
import { BaseParser } from './base-parser.js';
import { PdfParser } from './pdf-parser.js';
import { DocxParser } from './docx-parser.js';
import { CsvParser } from './csv-parser.js';
import { TextParser } from './text-parser.js';

const TEXT_PARSER = new TextParser();
const PDF_PARSER  = new PdfParser();
const DOCX_PARSER = new DocxParser();
const CSV_PARSER  = new CsvParser();

const REGISTRY: Record<SupportedFileType, BaseParser> = {
  pdf:  PDF_PARSER,
  docx: DOCX_PARSER,
  csv:  CSV_PARSER,
  txt:  TEXT_PARSER,
  md:   TEXT_PARSER,
  json: TEXT_PARSER,
  html: TEXT_PARSER,
  xml:  TEXT_PARSER,
  code: TEXT_PARSER,
};

/**
 * Retrieve the parser for a given file type.
 * Throws if no parser is registered (should never happen if FileLoader
 * validates the extension first).
 */
export function getParser(fileType: SupportedFileType): BaseParser {
  const parser = REGISTRY[fileType];
  if (!parser) {
    throw new Error(`No parser registered for file type: ${fileType}`);
  }
  return parser;
}
