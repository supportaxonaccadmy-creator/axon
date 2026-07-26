import type { FileValidationResult, FileType } from '@/types/file';
import { detectMimeType, detectFileType, getExtension } from './mimeHelper';
import { validateImage } from './imageHelper';
import { validatePdf } from './pdfHelper';
import { validateVideo } from './videoHelper';

export function validateFile(file: { name: string; size: number; type: string }, allowedTypes?: FileType[]): FileValidationResult {
  const fileType = detectFileType(file.type || detectMimeType(file.name));
  if (allowedTypes && !allowedTypes.includes(fileType)) {
    return { valid: false, type: fileType, extension: getExtension(file.name), mimeType: file.type || detectMimeType(file.name), errors: [`File type ${fileType} is not allowed. Allowed: ${allowedTypes.join(', ')}`] };
  }
  switch (fileType) {
    case 'image': return validateImage(file);
    case 'pdf': return validatePdf(file);
    case 'video': return validateVideo(file);
    default: return { valid: true, type: fileType, extension: getExtension(file.name), mimeType: file.type || detectMimeType(file.name), errors: [] };
  }
}

export function safeFilename(filename: string): string {
  return filename.toLowerCase().replace(/[^a-z0-9.\-_]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').replace(/\.{2,}/g, '.');
}

export function uniqueFilename(filename: string, existingNames: string[]): string {
  const safe = safeFilename(filename);
  if (!existingNames.includes(safe)) return safe;
  const ext = getExtension(safe);
  const base = ext ? safe.slice(0, -(ext.length + 1)) : safe;
  let counter = 2;
  let candidate = ext ? `${base}-${counter}.${ext}` : `${base}-${counter}`;
  while (existingNames.includes(candidate)) { counter += 1; candidate = ext ? `${base}-${counter}.${ext}` : `${base}-${counter}`; }
  return candidate;
}

export function buildStoragePath(bucket: string, path: string, filename: string): string {
  const safe = safeFilename(filename);
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  return cleanPath ? `${bucket}/${cleanPath}/${safe}` : `${bucket}/${safe}`;
}
