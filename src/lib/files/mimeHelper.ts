import type { FileType, FileMeta } from '@/types/file';

const MIME_MAP: Record<string, FileType> = {
  'image/jpeg': 'image', 'image/png': 'image', 'image/gif': 'image', 'image/webp': 'image', 'image/svg+xml': 'image',
  'application/pdf': 'pdf',
  'video/mp4': 'video', 'video/webm': 'video', 'video/ogg': 'video', 'video/x-msvideo': 'video',
  'audio/mpeg': 'audio', 'audio/ogg': 'audio', 'audio/wav': 'audio',
  'application/zip': 'archive', 'application/x-zip-compressed': 'archive',
  'application/msword': 'document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'text/plain': 'document', 'text/csv': 'document',
};

const EXTENSION_MAP: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  pdf: 'application/pdf',
  mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', avi: 'video/x-msvideo',
  mp3: 'audio/mpeg', wav: 'audio/wav',
  zip: 'application/zip',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain', csv: 'text/csv',
};

export function detectMimeType(filename: string): string {
  const ext = getExtension(filename);
  return EXTENSION_MAP[ext] ?? 'application/octet-stream';
}

export function detectFileType(mimeType: string): FileType {
  return MIME_MAP[mimeType] ?? 'unknown';
}

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function getFileType(filename: string): FileType {
  const mime = detectMimeType(filename);
  return detectFileType(mime);
}

export function getFileMeta(file: { name: string; size: number; type: string }): FileMeta {
  return {
    name: file.name, size: file.size, type: file.type,
    extension: getExtension(file.name),
    fileType: detectFileType(file.type || detectMimeType(file.name)),
  };
}

export function isImage(filename: string): boolean { return getFileType(filename) === 'image'; }
export function isPdf(filename: string): boolean { return getFileType(filename) === 'pdf'; }
export function isVideo(filename: string): boolean { return getFileType(filename) === 'video'; }
export function isAllowedType(filename: string, allowedTypes: FileType[]): boolean { return allowedTypes.includes(getFileType(filename)); }
