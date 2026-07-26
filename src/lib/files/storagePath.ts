import type { StoragePathConfig } from '@/types/file';
import { safeFilename, uniqueFilename } from './fileValidator';

export function generateStoragePath(bucket: string, path: string, filename: string): StoragePathConfig {
  const safe = safeFilename(filename);
  const cleanPath = path.replace(/^\/+ |\/+$/g, '');
  return { bucket, path: cleanPath, filename: safe, fullPath: cleanPath ? `${bucket}/${cleanPath}/${safe}` : `${bucket}/${safe}` };
}

export function generateUniqueStoragePath(bucket: string, path: string, filename: string, existingNames: string[]): StoragePathConfig {
  const unique = uniqueFilename(filename, existingNames);
  return generateStoragePath(bucket, path, unique);
}

export function extractPathFromUrl(url: string): string {
  try { const parsed = new URL(url); return parsed.pathname.replace(/^\/+/, ''); } catch { return url.replace(/^\/+/, ''); }
}

export function getBucketFromPath(fullPath: string): string { return fullPath.split('/')[0] ?? ''; }
export function getFilenameFromPath(fullPath: string): string { const parts = fullPath.split('/'); return parts[parts.length - 1] ?? ''; }
