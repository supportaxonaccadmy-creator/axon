export type FileType = 'image' | 'pdf' | 'video' | 'document' | 'audio' | 'archive' | 'unknown';

export interface FileValidationResult {
  valid: boolean;
  type: FileType;
  extension: string;
  mimeType: string;
  errors: string[];
}

export interface FileMeta {
  name: string;
  size: number;
  type: string;
  extension: string;
  fileType: FileType;
}

export interface StoragePathConfig {
  bucket: string;
  path: string;
  filename: string;
  fullPath: string;
}
