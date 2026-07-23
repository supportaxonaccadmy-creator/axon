export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const THEME_STORAGE_KEY = 'nursing-lms-theme';

export type ThemeMode = (typeof THEME)[keyof typeof THEME];
