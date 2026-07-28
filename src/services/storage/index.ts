export { storageService } from './storage.service';
export { STORAGE_BUCKETS, FILE_VALIDATION, FILE_SIZE_LABELS } from './storage.helpers';
export {
  validateFile, detectFileCategory, getBucketForCategory, formatFileSize,
  safeFilename, generateFilePath, compressImage, getFileExtension,
  isImage, isPdf, isVideo,
} from './storage.helpers';
export type {
  StorageBucket, FileCategory, FileStatus, EntityType, FileRecord,
  UploadFileOptions, UploadFileResult, ReplaceFileOptions, ReplaceFileResult,
  SignedUrlResult, FileValidationResult, StorageUsage, FileListOptions,
  FileListResult, CleanupResult, StorageAnalytics,
} from './storage.types';
