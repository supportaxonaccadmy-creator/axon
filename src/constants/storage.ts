export const STORAGE_KEYS = {
  THEME: 'nursing-lms-theme',
  SIDEBAR: 'nursing-lms-sidebar',
  TOASTS: 'nursing-lms-toasts',
  SESSION: 'nursing-lms-session',
  PREFERENCES: 'nursing-lms-preferences',
  LANGUAGE: 'nursing-lms-language',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
