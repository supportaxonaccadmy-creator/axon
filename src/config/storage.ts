import { SUPABASE_CONFIG } from '@/constants/supabase';

export const storageConfig = {
  defaultBucket: SUPABASE_CONFIG.STORAGE.DEFAULT_BUCKET,
  maxFileSize: SUPABASE_CONFIG.STORAGE.MAX_FILE_SIZE,
  allowedMimeTypes: SUPABASE_CONFIG.STORAGE.ALLOWED_MIME_TYPES,
  uploadTimeout: SUPABASE_CONFIG.STORAGE.UPLOAD_TIMEOUT,
} as const;
