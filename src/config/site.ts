import { APP_CONFIG } from '@/constants/app';

export const siteConfig = {
  name: APP_CONFIG.name,
  shortName: APP_CONFIG.shortName,
  description: APP_CONFIG.description,
  locale: APP_CONFIG.locale,
};

export const envConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
