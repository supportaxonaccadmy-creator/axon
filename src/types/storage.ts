export interface UploadOptions {
  contentType?: string | undefined;
  cacheControl?: string | undefined;
  upsert?: boolean | undefined;
  metadata?: Record<string, string> | undefined;
}

export interface UploadResult {
  path: string;
  id: string | undefined;
  fullPath: string;
}

export interface DownloadResult {
  data: Blob;
  mimeType: string | undefined;
  size: number | undefined;
}

export interface FileMetadata {
  name: string;
  id: string | undefined;
  updatedAt: string | undefined;
  createdAt: string | undefined;
  lastAccessedAt: string | undefined;
  metadata: Record<string, unknown> | undefined;
}

export interface ListFilesOptions {
  limit?: number | undefined;
  offset?: number | undefined;
  sortBy?: { column: string; order: 'asc' | 'desc' } | undefined;
  search?: string | undefined;
}

export interface ListFilesResult {
  files: FileMetadata[];
  hasMore: boolean;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  createdAt: string;
  updatedAt: string | undefined;
}

export interface PublicUrlResult {
  url: string;
}
