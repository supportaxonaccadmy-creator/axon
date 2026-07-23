import { getSupabaseClient } from '@/lib/supabase';
import type {
  UploadOptions,
  UploadResult,
  DownloadResult,
  FileMetadata,
  ListFilesOptions,
  ListFilesResult,
  PublicUrlResult,
} from '@/types/storage';
import { storageConfig } from '@/config/storage';
import { logger } from '@/lib/logger';

class StorageService {
  async upload(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: UploadOptions,
  ): Promise<{ data: UploadResult | null; error: string | null }> {
    const uploadParams: Record<string, unknown> = {
      contentType: options?.contentType ?? 'application/octet-stream',
      cacheControl: options?.cacheControl ?? '3600',
      upsert: options?.upsert ?? false,
    };
    if (options?.metadata) uploadParams.metadata = options.metadata;

    const { data, error } = await getSupabaseClient()
      .storage.from(bucket)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upload(path, file, uploadParams as any);

    if (error) {
      logger.error('Storage upload error', { bucket, path, error: error.message });
      return { data: null, error: error.message };
    }
    if (!data) return { data: null, error: 'No data returned from upload' };
    return {
      data: { path: data.path, id: data.id, fullPath: data.fullPath },
      error: null,
    };
  }

  async download(bucket: string, path: string): Promise<{ data: DownloadResult | null; error: string | null }> {
    const { data, error } = await getSupabaseClient()
      .storage.from(bucket)
      .download(path);

    if (error) {
      logger.error('Storage download error', { bucket, path, error: error.message });
      return { data: null, error: error.message };
    }
    if (!data) return { data: null, error: 'No data returned from download' };
    return {
      data: {
        data,
        mimeType: data.type,
        size: data.size,
      },
      error: null,
    };
  }

  async delete(bucket: string, paths: string[]): Promise<{ error: string | null }> {
    const { error } = await getSupabaseClient()
      .storage.from(bucket)
      .remove(paths);

    if (error) {
      logger.error('Storage delete error', { bucket, paths, error: error.message });
      return { error: error.message };
    }
    return { error: null };
  }

  getPublicUrl(bucket: string, path: string): PublicUrlResult {
    const { data } = getSupabaseClient().storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl };
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<{ url: string | null; error: string | null }> {
    const { data, error } = await getSupabaseClient()
      .storage.from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      logger.error('Storage signed URL error', { bucket, path, error: error.message });
      return { url: null, error: error.message };
    }
    return { url: data?.signedUrl ?? null, error: null };
  }

  async list(bucket: string, folder: string, options?: ListFilesOptions): Promise<{ data: ListFilesResult | null; error: string | null }> {
    const listParams: { limit?: number; offset?: number; sortBy?: { column: string; order: 'asc' | 'desc' }; search?: string } = {};
    if (options?.limit !== undefined) listParams.limit = options.limit;
    if (options?.offset !== undefined) listParams.offset = options.offset;
    if (options?.sortBy) listParams.sortBy = options.sortBy;
    if (options?.search) listParams.search = options.search;

    const { data, error } = await getSupabaseClient()
      .storage.from(bucket)
      .list(folder, listParams);

    if (error) {
      logger.error('Storage list error', { bucket, folder, error: error.message });
      return { data: null, error: error.message };
    }
    if (!data) return { data: null, error: 'No data returned from list' };
    const files: FileMetadata[] = data.map((item) => ({
      name: item.name,
      id: item.id ?? undefined,
      updatedAt: item.updated_at ?? undefined,
      createdAt: item.created_at ?? undefined,
      lastAccessedAt: item.last_accessed_at ?? undefined,
      metadata: item.metadata as Record<string, unknown> | undefined,
    }));
    return {
      data: {
        files,
        hasMore: files.length === (options?.limit ?? 100),
      },
      error: null,
    };
  }

  validateFileSize(file: File): boolean {
    return file.size <= storageConfig.maxFileSize;
  }

  validateMimeType(file: File): boolean {
    return (storageConfig.allowedMimeTypes as readonly string[]).includes(file.type);
  }
}

export const storageService = new StorageService();
export { StorageService };
