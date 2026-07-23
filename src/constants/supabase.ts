export const SUPABASE_CONFIG = {
  URL_ENV_KEY: 'VITE_SUPABASE_URL',
  ANON_KEY_ENV_KEY: 'VITE_SUPABASE_ANON_KEY',

  AUTH: {
    PERSIST_SESSION: true,
    AUTO_REFRESH_TOKEN: true,
    DETECT_SESSION_IN_URL: true,
    FLOW_TYPE: 'pkce' as const,
  },

  REALTIME: {
    EVENTS_PER_SECOND: 10,
    RECONNECT_DELAY_MS: 1000,
    MAX_RECONNECT_ATTEMPTS: 5,
  },

  STORAGE: {
    DEFAULT_BUCKET: 'public',
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    UPLOAD_TIMEOUT: 60000,
    ALLOWED_MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
    ],
  },
} as const;
