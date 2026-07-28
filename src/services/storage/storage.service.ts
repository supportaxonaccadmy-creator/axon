import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  UploadFileOptions, UploadFileResult, ReplaceFileOptions, ReplaceFileResult,
  SignedUrlResult, FileRecord, FileListOptions, FileListResult,
  StorageUsage, StorageAnalytics, CleanupResult, FileCategory, StorageBucket,
} from './storage.types';
import {
  validateFile, generateFilePath, compressImage, detectFileCategory,
  STORAGE_BUCKETS, formatFileSize,
} from './storage.helpers';

function mapRow(row: Record<string, unknown>): FileRecord {
  return {
    id: String(row.id),
    storageBucket: String(row.storage_bucket),
    filePath: String(row.file_path),
    fileName: String(row.file_name),
    originalName: String(row.original_name),
    mimeType: String(row.mime_type),
    fileSize: Number(row.file_size),
    fileType: row.file_type as FileCategory,
    uploadedBy: (row.uploaded_by as string | null) ?? null,
    entityType: (row.entity_type as FileRecord['entityType']) ?? null,
    entityId: (row.entity_id as string | null) ?? null,
    isPublic: Boolean(row.is_public),
    status: row.status as FileRecord['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const storageService = {
  async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
    try {
      const { file, bucket, entityType, entityId, isPublic = false, onProgress, signal } = options;

      const validation = validateFile(file);
      if (!validation.valid) {
        return { fileRecord: null, error: validation.errors.join(', ') };
      }

      let fileToUpload = file;
      if (validation.fileType === 'image') {
        try {
          fileToUpload = await compressImage(file);
        } catch (compressErr) {
          logger.warn('Image compression failed, uploading original', { error: compressErr instanceof Error ? compressErr.message : 'Unknown' });
        }
      }

      const filePath = generateFilePath(bucket, entityType, entityId, fileToUpload.name);
      const supabase = getSupabaseClient();

      const uploadParams: Record<string, unknown> = {
        contentType: fileToUpload.type,
        cacheControl: '3600',
        upsert: false,
      };

      let uploadResult;
      if (signal) {
        uploadResult = await supabase.storage
          .from(bucket)
          .upload(filePath, fileToUpload, uploadParams);
      } else {
        uploadResult = await supabase.storage
          .from(bucket)
          .upload(filePath, fileToUpload, uploadParams);
      }

      if (uploadResult.error) {
        logger.error('storageService.uploadFile', { error: uploadResult.error.message });
        return { fileRecord: null, error: uploadResult.error.message };
      }

      if (onProgress) onProgress(100);

      const { data: authData } = await supabase.auth.getUser();
      const uploadedBy = authData.user?.id ?? null;

      const insertData: Record<string, unknown> = {
        storage_bucket: bucket,
        file_path: filePath,
        file_name: filePath.split('/').pop() ?? fileToUpload.name,
        original_name: file.name,
        mime_type: fileToUpload.type,
        file_size: fileToUpload.size,
        file_type: validation.fileType,
        uploaded_by: uploadedBy,
        entity_type: entityType ?? null,
        entity_id: entityId ?? null,
        is_public: isPublic,
        status: 'active',
      };

      const { data: recordData, error: recordError } = await supabase
        .from('files')
        .insert(insertData)
        .select('*')
        .maybeSingle();

      if (recordError) {
        logger.error('storageService.uploadFile: insert record', { error: recordError.message });
        await supabase.storage.from(bucket).remove([filePath]);
        return { fileRecord: null, error: recordError.message };
      }

      return { fileRecord: recordData ? mapRow(recordData as Record<string, unknown>) : null, error: null };
    } catch (err) {
      logger.error('storageService.uploadFile: exception', { error: err instanceof Error ? err.message : 'Unknown' });
      return { fileRecord: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async deleteFile(fileId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: file, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .maybeSingle();

      if (fetchError || !file) {
        return { error: fetchError?.message ?? 'File not found' };
      }

      const fileRow = file as Record<string, unknown>;
      const bucket = String(fileRow.storage_bucket);
      const path = String(fileRow.file_path);

      const { error: storageError } = await supabase.storage.from(bucket).remove([path]);
      if (storageError) {
        logger.warn('storageService.deleteFile: storage remove failed', { error: storageError.message });
      }

      const { error: dbError } = await supabase
        .from('files')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', fileId);

      if (dbError) {
        return { error: dbError.message };
      }

      return { error: null };
    } catch (err) {
      logger.error('storageService.deleteFile', { error: err instanceof Error ? err.message : 'Unknown' });
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async bulkDeleteFiles(fileIds: string[]): Promise<{ deletedCount: number; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: files, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .in('id', fileIds);

      if (fetchError) return { deletedCount: 0, error: fetchError.message };

      const rows = (files ?? []) as Array<Record<string, unknown>>;
      const byBucket: Record<string, string[]> = {};
      for (const row of rows) {
        const bucket = String(row.storage_bucket);
        const path = String(row.file_path);
        if (!byBucket[bucket]) byBucket[bucket] = [];
        byBucket[bucket].push(path);
      }

      for (const [bucket, paths] of Object.entries(byBucket)) {
        await supabase.storage.from(bucket).remove(paths);
      }

      const { error: dbError } = await supabase
        .from('files')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .in('id', fileIds);

      if (dbError) return { deletedCount: 0, error: dbError.message };

      return { deletedCount: fileIds.length, error: null };
    } catch (err) {
      return { deletedCount: 0, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async replaceFile(options: ReplaceFileOptions): Promise<ReplaceFileResult> {
    try {
      const { fileId, newFile, onProgress, signal } = options;
      const supabase = getSupabaseClient();

      const { data: existingFile, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .maybeSingle();

      if (fetchError || !existingFile) {
        return { fileRecord: null, error: fetchError?.message ?? 'File not found' };
      }

      const existingRow = existingFile as Record<string, unknown>;
      const bucket = String(existingRow.storage_bucket);
      const oldPath = String(existingRow.file_path);

      const validation = validateFile(newFile);
      if (!validation.valid) {
        return { fileRecord: null, error: validation.errors.join(', ') };
      }

      let fileToUpload = newFile;
      if (validation.fileType === 'image') {
        try {
          fileToUpload = await compressImage(newFile);
        } catch { /* use original */ }
      }

      const newPath = generateFilePath(
        bucket as StorageBucket,
        existingRow.entity_type as string | undefined,
        existingRow.entity_id as string | undefined,
        fileToUpload.name,
      );

      const uploadParams: Record<string, unknown> = {
        contentType: fileToUpload.type,
        cacheControl: '3600',
        upsert: false,
      };

      void signal;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(newPath, fileToUpload, uploadParams);

      if (uploadError) {
        return { fileRecord: null, error: uploadError.message };
      }

      if (onProgress) onProgress(100);

      await supabase.storage.from(bucket).remove([oldPath]);

      const { data: updatedRecord, error: updateError } = await supabase
        .from('files')
        .update({
          file_path: newPath,
          file_name: newPath.split('/').pop() ?? fileToUpload.name,
          original_name: newFile.name,
          mime_type: fileToUpload.type,
          file_size: fileToUpload.size,
          file_type: validation.fileType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fileId)
        .select('*')
        .maybeSingle();

      if (updateError) {
        return { fileRecord: null, error: updateError.message };
      }

      return { fileRecord: updatedRecord ? mapRow(updatedRecord as Record<string, unknown>) : null, error: null };
    } catch (err) {
      logger.error('storageService.replaceFile', { error: err instanceof Error ? err.message : 'Unknown' });
      return { fileRecord: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  getFileUrl(bucket: string, path: string): string {
    const supabase = getSupabaseClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<SignedUrlResult> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        logger.error('storageService.getSignedUrl', { error: error.message });
        return { url: null, error: error.message };
      }

      return { url: data?.signedUrl ?? null, error: null };
    } catch (err) {
      return { url: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getFileById(fileId: string): Promise<{ data: FileRecord | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .maybeSingle();

      if (error) return { data: null, error: error.message };
      if (!data) return { data: null, error: 'File not found' };
      return { data: mapRow(data as Record<string, unknown>), error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getFiles(options: FileListOptions = {}): Promise<FileListResult> {
    try {
      const {
        fileType, bucket, entityType, entityId, search,
        page = 1, pageSize = 20,
        sortBy = 'created_at', sortOrder = 'desc',
      } = options;

      const supabase = getSupabaseClient();
      let query = supabase.from('files').select('*', { count: 'exact' }).eq('status', 'active');

      if (fileType) query = query.eq('file_type', fileType);
      if (bucket) query = query.eq('storage_bucket', bucket);
      if (entityType) query = query.eq('entity_type', entityType);
      if (entityId) query = query.eq('entity_id', entityId);
      if (search) query = query.ilike('original_name', `%${search}%`);

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        return { files: [], total: 0, page, pageSize, hasMore: false };
      }

      const files = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
      const total = count ?? 0;

      return {
        files,
        total,
        page,
        pageSize,
        hasMore: offset + files.length < total,
      };
    } catch (err) {
      logger.error('storageService.getFiles', { error: err instanceof Error ? err.message : 'Unknown' });
      return { files: [], total: 0, page: options.page ?? 1, pageSize: options.pageSize ?? 20, hasMore: false };
    }
  },

  async getStorageUsage(): Promise<{ data: StorageUsage | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('files')
        .select('file_type, file_size, storage_bucket')
        .eq('status', 'active');

      if (error) return { data: null, error: error.message };

      const rows = (data ?? []) as Array<Record<string, unknown>>;
      const usage: StorageUsage = {
        totalFiles: rows.length,
        totalSize: 0,
        byType: {
          image: { count: 0, size: 0 },
          pdf: { count: 0, size: 0 },
          video: { count: 0, size: 0 },
          document: { count: 0, size: 0 },
        },
        byBucket: {
          'course-assets': { count: 0, size: 0 },
          'pdf-notes': { count: 0, size: 0 },
          'videos': { count: 0, size: 0 },
          'profile-media': { count: 0, size: 0 },
        },
      };

      for (const row of rows) {
        const fileType = row.file_type as FileCategory;
        const fileSize = Number(row.file_size);
        const storageBucket = row.storage_bucket as StorageBucket;

        usage.totalSize += fileSize;

        if (usage.byType[fileType]) {
          usage.byType[fileType].count += 1;
          usage.byType[fileType].size += fileSize;
        }

        if (usage.byBucket[storageBucket]) {
          usage.byBucket[storageBucket].count += 1;
          usage.byBucket[storageBucket].size += fileSize;
        }
      }

      return { data: usage, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStorageAnalytics(): Promise<{ data: StorageAnalytics | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('files')
        .select('file_type, file_size, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) return { data: null, error: error.message };

      const rows = (data ?? []) as Array<Record<string, unknown>>;
      const analytics: StorageAnalytics = {
        totalFiles: rows.length,
        totalSize: 0,
        imagesCount: 0,
        pdfsCount: 0,
        videosCount: 0,
        documentsCount: 0,
        monthlyUploads: [],
        typeDistribution: [
          { type: 'image', count: 0, size: 0 },
          { type: 'pdf', count: 0, size: 0 },
          { type: 'video', count: 0, size: 0 },
          { type: 'document', count: 0, size: 0 },
        ],
      };

      const monthMap: Record<string, { count: number; size: number }> = {};

      for (const row of rows) {
        const fileType = row.file_type as FileCategory;
        const fileSize = Number(row.file_size);
        const createdAt = String(row.created_at);

        analytics.totalSize += fileSize;

        switch (fileType) {
          case 'image': analytics.imagesCount += 1; break;
          case 'pdf': analytics.pdfsCount += 1; break;
          case 'video': analytics.videosCount += 1; break;
          case 'document': analytics.documentsCount += 1; break;
        }

        const dist = analytics.typeDistribution.find((d) => d.type === fileType);
        if (dist) { dist.count += 1; dist.size += fileSize; }

        const date = new Date(createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[monthKey]) monthMap[monthKey] = { count: 0, size: 0 };
        monthMap[monthKey].count += 1;
        monthMap[monthKey].size += fileSize;
      }

      analytics.monthlyUploads = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, val]) => ({ month, ...val }));

      return { data: analytics, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async cleanupUnusedFiles(): Promise<CleanupResult> {
    try {
      const supabase = getSupabaseClient();
      const { data: orphanFiles, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('status', 'replaced');

      if (fetchError) return { deletedCount: 0, freedBytes: 0, error: fetchError.message };

      const rows = (orphanFiles ?? []) as Array<Record<string, unknown>>;
      let deletedCount = 0;
      let freedBytes = 0;

      for (const row of rows) {
        const bucket = String(row.storage_bucket);
        const path = String(row.file_path);
        const size = Number(row.file_size);

        const { error: removeError } = await supabase.storage.from(bucket).remove([path]);
        if (!removeError) {
          deletedCount += 1;
          freedBytes += size;
        }
      }

      if (rows.length > 0) {
        await supabase
          .from('files')
          .update({ status: 'deleted', updated_at: new Date().toISOString() })
          .eq('status', 'replaced');
      }

      return { deletedCount, freedBytes, error: null };
    } catch (err) {
      return { deletedCount: 0, freedBytes: 0, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async checkStudentAccess(profileId: string, fileId: string): Promise<{ allowed: boolean; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('status', 'active')
        .maybeSingle();

      if (fileError || !file) {
        return { allowed: false, error: 'File not found' };
      }

      const fileRow = file as Record<string, unknown>;

      if (fileRow.is_public === true) {
        return { allowed: true, error: null };
      }

      const entityType = fileRow.entity_type;
      const entityId = fileRow.entity_id;

      if (entityType === 'batch' && entityId) {
        const { data: enrollment, error: enrollError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('profile_id', profileId)
          .eq('batch_id', String(entityId))
          .eq('access_status', 'active')
          .maybeSingle();

        if (enrollError) return { allowed: false, error: enrollError.message };
        return { allowed: !!enrollment, error: null };
      }

      return { allowed: false, error: 'Access denied' };
    } catch (err) {
      return { allowed: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getSignedUrlForStudent(profileId: string, fileId: string, expiresIn: number = 3600): Promise<SignedUrlResult> {
    const { allowed, error } = await this.checkStudentAccess(profileId, fileId);
    if (!allowed) {
      return { url: null, error: error ?? 'Access denied' };
    }

    const { data: file } = await this.getFileById(fileId);
    if (!file) return { url: null, error: 'File not found' };

    return this.getSignedUrl(file.storageBucket, file.filePath, expiresIn);
  },
};

export { STORAGE_BUCKETS, formatFileSize, detectFileCategory };
