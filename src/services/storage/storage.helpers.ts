import type { FileCategory, FileValidationResult, StorageBucket } from './storage.types';

export const STORAGE_BUCKETS = {
  COURSE_ASSETS: 'course-assets' as StorageBucket,
  PDF_NOTES: 'pdf-notes' as StorageBucket,
  VIDEOS: 'videos' as StorageBucket,
  PROFILE_MEDIA: 'profile-media' as StorageBucket,
} as const;

export const FILE_VALIDATION = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024,
    MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
  PDF: {
    MAX_SIZE: 50 * 1024 * 1024,
    MIME_TYPES: ['application/pdf'],
  },
  VIDEO: {
    MAX_SIZE: 2 * 1024 * 1024 * 1024,
    MIME_TYPES: ['video/mp4', 'video/webm'],
  },
  DOCUMENT: {
    MAX_SIZE: 20 * 1024 * 1024,
    MIME_TYPES: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
} as const;

export const FILE_SIZE_LABELS = {
  IMAGE: '5 MB',
  PDF: '50 MB',
  VIDEO: '2 GB',
  DOCUMENT: '20 MB',
} as const;

const MIME_TO_CATEGORY: Record<string, FileCategory> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'application/pdf': 'pdf',
  'video/mp4': 'video',
  'video/webm': 'video',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
};

export function detectFileCategory(mimeType: string): FileCategory {
  return MIME_TO_CATEGORY[mimeType] ?? 'document';
}

export function validateFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const fileType: FileCategory = detectFileCategory(file.type);

  if (file.size === 0) {
    errors.push('File is empty');
    return { valid: false, errors, fileType };
  }

  const config = fileType === 'image' ? FILE_VALIDATION.IMAGE
    : fileType === 'pdf' ? FILE_VALIDATION.PDF
    : fileType === 'video' ? FILE_VALIDATION.VIDEO
    : FILE_VALIDATION.DOCUMENT;

  if (!(config.MIME_TYPES as readonly string[]).includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed`);
  }

  if (file.size > config.MAX_SIZE) {
    const maxLabel = fileType === 'image' ? FILE_SIZE_LABELS.IMAGE
      : fileType === 'pdf' ? FILE_SIZE_LABELS.PDF
      : fileType === 'video' ? FILE_SIZE_LABELS.VIDEO
      : FILE_SIZE_LABELS.DOCUMENT;
    errors.push(`File size exceeds maximum of ${maxLabel}`);
  }

  return { valid: errors.length === 0, errors, fileType };
}

export function getBucketForCategory(category: FileCategory): StorageBucket {
  switch (category) {
    case 'image': return STORAGE_BUCKETS.COURSE_ASSETS;
    case 'pdf': return STORAGE_BUCKETS.PDF_NOTES;
    case 'video': return STORAGE_BUCKETS.VIDEOS;
    case 'document': return STORAGE_BUCKETS.PDF_NOTES;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function safeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/\.{2,}/g, '.');
}

export function generateFilePath(
  _bucket: StorageBucket,
  entityType: string | undefined,
  entityId: string | undefined,
  filename: string,
): string {
  const safe = safeFilename(filename);
  const timestamp = Date.now();
  const uniqueName = `${timestamp}-${safe}`;
  if (entityType && entityId) {
    return `${entityType}/${entityId}/${uniqueName}`;
  }
  return `general/${uniqueName}`;
}

export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.82,
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.naturalWidth <= maxWidth && file.size <= 5 * 1024 * 1024) {
        resolve(file);
        return;
      }

      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const width = Math.round(img.naturalWidth * scale);
      const height = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name, { type: file.type });
          resolve(compressed);
        },
        file.type,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts[parts.length - 1] ?? '').toLowerCase() : '';
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}
