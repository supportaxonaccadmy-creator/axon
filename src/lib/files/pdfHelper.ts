import type { FileValidationResult, FileType } from '@/types/file';
import { detectMimeType, getExtension } from './mimeHelper';

const MAX_PDF_SIZE = 50 * 1024 * 1024;
const ALLOWED_PDF_EXTENSIONS = ['pdf'];
const ALLOWED_PDF_MIMES = ['application/pdf'];

export function validatePdf(file: { name: string; size: number; type: string }): FileValidationResult {
  const errors: string[] = [];
  const extension = getExtension(file.name);
  const mimeType = file.type || detectMimeType(file.name);
  if (!ALLOWED_PDF_EXTENSIONS.includes(extension)) errors.push(`PDF extension .${extension} is not allowed. Allowed: ${ALLOWED_PDF_EXTENSIONS.join(', ')}`);
  if (!ALLOWED_PDF_MIMES.includes(mimeType)) errors.push(`PDF MIME type ${mimeType} is not allowed`);
  if (file.size > MAX_PDF_SIZE) errors.push(`PDF size exceeds maximum of ${MAX_PDF_SIZE / 1024 / 1024}MB`);
  if (file.size === 0) errors.push('PDF file is empty');
  return { valid: errors.length === 0, type: 'pdf' as FileType, extension, mimeType, errors };
}

export function formatPdfSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
