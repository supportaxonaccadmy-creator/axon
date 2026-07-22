/**
 * Application-level configuration constants.
 */

export const APP_CONFIG = {
  name: 'Enterprise Nursing LMS',
  shortName: 'Nursing LMS',
  version: '0.0.0',
  description: 'Enterprise Learning Management System for Nursing Education',
  locale: 'en-US',
  timezone: 'UTC',
} as const;

export type AppConfig = typeof APP_CONFIG;
