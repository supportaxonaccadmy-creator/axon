/**
 * Application environment configuration.
 * Reads Vite environment variables and validates required values are present.
 */

type EnvKey = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_APP_NAME' | 'VITE_APP_URL';

function getEnv(key: EnvKey, fallback = ''): string {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    if (fallback) return fallback;
    console.warn(`[env] Missing environment variable: ${key}`);
    return '';
  }
  return value as string;
}

export const env = {
  supabaseUrl: getEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
  appName: getEnv('VITE_APP_NAME', 'Enterprise Nursing LMS'),
  appUrl: getEnv('VITE_APP_URL', 'http://localhost:5173'),
} as const;

export type Env = typeof env;
