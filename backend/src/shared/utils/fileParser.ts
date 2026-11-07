import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';
import AppError from './appError';
import logger from './logger';

export const extractTextFromFile = async (buffer: Buffer, filename: string): Promise<string> => {
  const ext = path.extname(filename).toLowerCase();
  try {
    if (ext === '.pdf') {
      const parsed = await pdfParse(buffer);
      return parsed.text || '';
    }
    if (['.docx', '.doc'].includes(ext)) {
      const parsed = await mammoth.extractRawText({ buffer });
      return parsed.value || '';
    }
    return buffer.toString('utf-8');
  } catch (error: any) {
    logger.warn(`[FileParser] Failed to extract text from document (${filename}): ${error.message}`);
    throw new AppError('Invalid or corrupted document file. Could not extract text.', 400);
  }
};
