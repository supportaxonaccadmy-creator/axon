export const AUTH_CONFIG = {
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
  TOKEN_REFRESH_INTERVAL_MS: 10 * 60 * 1000,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  PASSWORD_RESET_REDIRECT: '/auth/reset-password',
  EMAIL_CONFIRM_REDIRECT: '/auth/verify-email',
  OAUTH_REDIRECT: '/auth/callback',
} as const;

export const AUTH_EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  USER_UPDATED: 'USER_UPDATED',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
  INITIAL_SESSION: 'INITIAL_SESSION',
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  SESSION_EXPIRED: 'Session has expired',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN: 'An unknown authentication error occurred',
} as const;
