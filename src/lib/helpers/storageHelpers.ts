import { storageService } from '@/lib/storage/storageService';
import type { UploadOptions, UploadResult } from '@/types/storage';
import { storageConfig } from '@/config/storage';

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: UploadOptions,
): Promise<{ data: UploadResult | null; error: string | null }> {
  if (!storageService.validateFileSize(file)) {
    return {
      data: null,
      error: `File size exceeds maximum of ${storageConfig.maxFileSize} bytes`,
    };
  }

  if (!storageService.validateMimeType(file)) {
    return {
      data: null,
      error: `File type "${file.type}" is not allowed`,
    };
  }

  return storageService.upload(bucket, path, file, options);
}

export async function downloadFile(
  bucket: string,
  path: string,
): Promise<{ data: Blob | null; error: string | null }> {
  const { data, error } = await storageService.download(bucket, path);
  return { data: data?.data ?? null, error };
}

export async function deleteFile(
  bucket: string,
  path: string,
): Promise<{ error: string | null }> {
  return storageService.delete(bucket, [path]);
}

export function getPublicUrl(bucket: string, path: string): string {
  return storageService.getPublicUrl(bucket, path).url;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600,
): Promise<{ url: string | null; error: string | null }> {
  return storageService.createSignedUrl(bucket, path, expiresIn);
}
