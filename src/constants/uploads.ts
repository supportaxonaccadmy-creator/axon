export const UPLOAD_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  MAX_PDF_SIZE: 50 * 1024 * 1024,
  MAX_VIDEO_SIZE: 500 * 1024 * 1024,
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024,
  MAX_AVATAR_SIZE: 2 * 1024 * 1024,
  MAX_THUMBNAIL_SIZE: 5 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] as const;
export const ALLOWED_PDF_TYPES = ['application/pdf'] as const;
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-msvideo'] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] as const;
export const ALLOWED_PDF_EXTENSIONS = ['pdf'] as const;
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'avi'] as const;

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  THUMBNAILS: 'thumbnails',
  BANNERS: 'banners',
  PDF_NOTES: 'pdf-notes',
  VIDEOS: 'videos',
  ATTACHMENTS: 'attachments',
  MCQ_IMAGES: 'mcq-images',
} as const;

export const RESERVED_SLUGS = [
  'admin', 'api', 'auth', 'login', 'register', 'logout', 'settings', 'profile',
  'dashboard', 'search', 'about', 'contact', 'help', 'support', 'terms',
  'privacy', 'policy', 'legal', 'system', 'config', 'static', 'assets',
  'public', 'private', 'internal', 'test', 'debug', 'dev', 'staging',
  'production', 'www', 'mail', 'ftp', 'localhost', 'superuser', 'root',
  'new', 'edit', 'create', 'delete', 'update', 'view', 'list', 'index',
] as const;
