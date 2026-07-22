export const APP_CONFIG = {
  name: 'Enterprise Nursing LMS',
  shortName: 'Nursing LMS',
  version: '0.0.0',
  description: 'Enterprise Learning Management System for Nursing Education',
  locale: 'en-US',
  currency: 'INR',
  currencySymbol: '₹',
} as const;

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  timeout: 30000,
  retries: 3,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

export const DEFAULT_VALUES = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 300,
  TOAST_DURATION: 5000,
  TOAST_MAX_VISIBLE: 5,
  SKELETON_ANIMATION_DURATION: 1500,
} as const;
