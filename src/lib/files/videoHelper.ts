import type { FileValidationResult, FileType } from '@/types/file';
import { detectMimeType, getExtension } from './mimeHelper';

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'avi'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-msvideo'];

export function validateVideo(file: { name: string; size: number; type: string }): FileValidationResult {
  const errors: string[] = [];
  const extension = getExtension(file.name);
  const mimeType = file.type || detectMimeType(file.name);
  if (!ALLOWED_VIDEO_EXTENSIONS.includes(extension)) errors.push(`Video extension .${extension} is not allowed. Allowed: ${ALLOWED_VIDEO_EXTENSIONS.join(', ')}`);
  if (!ALLOWED_VIDEO_MIMES.includes(mimeType)) errors.push(`Video MIME type ${mimeType} is not allowed`);
  if (file.size > MAX_VIDEO_SIZE) errors.push(`Video size exceeds maximum of ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
  if (file.size === 0) errors.push('Video file is empty');
  return { valid: errors.length === 0, type: 'video' as FileType, extension, mimeType, errors };
}

export function formatVideoSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatVideoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
