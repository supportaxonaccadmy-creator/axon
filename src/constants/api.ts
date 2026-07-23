export const API_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  MAX_TIMEOUT: 60000,
  DEFAULT_RETRIES: 3,
  MAX_RETRIES: 5,
  RETRY_DELAY: 1000,
  RETRY_BACKOFF_FACTOR: 2,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  } as Record<string, string>,
  AUTH_HEADER: 'Authorization',
  AUTH_PREFIX: 'Bearer',
  REQUEST_ID_HEADER: 'X-Request-Id',
  CLIENT_INFO_HEADER: 'X-Client-Info',
} as const;
