/**
 * Local storage key constants.
 * Namespaced to avoid collisions with other applications.
 */

const PREFIX = 'nursing_lms_';

export const STORAGE_KEYS = {
  AUTH_TOKEN: `${PREFIX}auth_token`,
  USER_PREFERENCES: `${PREFIX}user_preferences`,
  THEME: `${PREFIX}theme`,
  LANGUAGE: `${PREFIX}language`,
  ONBOARDED: `${PREFIX}onboarded`,
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
