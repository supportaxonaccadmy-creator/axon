/**
 * Site-level configuration for metadata, branding, and navigation.
 */

export const SITE_CONFIG = {
  title: 'Enterprise Nursing LMS',
  tagline: 'Empowering Nursing Excellence Through Education',
  author: 'Enterprise Nursing LMS',
  logo: '/logo.svg',
  favicon: '/favicon.svg',
  links: {
    home: '/',
    dashboard: '/dashboard',
    courses: '/courses',
    profile: '/profile',
    settings: '/settings',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
