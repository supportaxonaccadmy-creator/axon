import type { FileValidationResult, FileType } from '@/types/file';
import { detectMimeType, getExtension } from './mimeHelper';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export function validateImage(file: { name: string; size: number; type: string }): FileValidationResult {
  const errors: string[] = [];
  const extension = getExtension(file.name);
  const mimeType = file.type || detectMimeType(file.name);
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) errors.push(`Image extension .${extension} is not allowed. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`);
  if (!ALLOWED_IMAGE_MIMES.includes(mimeType)) errors.push(`Image MIME type ${mimeType} is not allowed`);
  if (file.size > MAX_IMAGE_SIZE) errors.push(`Image size exceeds maximum of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
  if (file.size === 0) errors.push('Image file is empty');
  return { valid: errors.length === 0, type: 'image' as FileType, extension, mimeType, errors };
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function isImageSquare(width: number, height: number): boolean { return width === height; }
export function getImageAspectRatio(width: number, height: number): number { return height === 0 ? 0 : width / height; }
