export type StorageBucket = 'course-assets' | 'pdf-notes' | 'videos' | 'profile-media';

export type FileCategory = 'image' | 'pdf' | 'video' | 'document';

export type FileStatus = 'active' | 'deleted' | 'replaced';

export type EntityType = 'batch' | 'subject' | 'chapter' | 'class' | 'pdf' | 'profile' | 'general';

export interface FileRecord {
  id: string;
  storageBucket: string;
  filePath: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileType: FileCategory;
  uploadedBy: string | null;
  entityType: EntityType | null;
  entityId: string | null;
  isPublic: boolean;
  status: FileStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileOptions {
  bucket: StorageBucket;
  file: File;
  entityType?: EntityType | undefined;
  entityId?: string | undefined;
  isPublic?: boolean | undefined;
  onProgress?: ((percentage: number) => void) | undefined;
  signal?: AbortSignal | undefined;
}

export interface UploadFileResult {
  fileRecord: FileRecord | null;
  error: string | null;
}

export interface ReplaceFileOptions {
  fileId: string;
  newFile: File;
  onProgress?: ((percentage: number) => void) | undefined;
  signal?: AbortSignal | undefined;
}

export interface ReplaceFileResult {
  fileRecord: FileRecord | null;
  error: string | null;
}

export interface SignedUrlResult {
  url: string | null;
  error: string | null;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  fileType: FileCategory;
}

export interface StorageUsage {
  totalFiles: number;
  totalSize: number;
  byType: Record<FileCategory, { count: number; size: number }>;
  byBucket: Record<StorageBucket, { count: number; size: number }>;
}

export interface FileListOptions {
  fileType?: FileCategory | undefined;
  bucket?: StorageBucket | undefined;
  entityType?: EntityType | undefined;
  entityId?: string | undefined;
  search?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  sortBy?: 'created_at' | 'file_size' | 'original_name' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface FileListResult {
  files: FileRecord[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CleanupResult {
  deletedCount: number;
  freedBytes: number;
  error: string | null;
}

export interface StorageAnalytics {
  totalFiles: number;
  totalSize: number;
  imagesCount: number;
  pdfsCount: number;
  videosCount: number;
  documentsCount: number;
  monthlyUploads: Array<{ month: string; count: number; size: number }>;
  typeDistribution: Array<{ type: FileCategory; count: number; size: number }>;
}
