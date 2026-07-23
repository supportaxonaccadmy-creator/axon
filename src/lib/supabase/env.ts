import { SUPABASE_CONFIG } from '@/constants/supabase';
import { environmentConfig } from '@/config/runtime';

export interface SupabaseEnvValidationResult {
  valid: boolean;
  error: string | null;
  url: string;
  anonKey: string;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function isValidAnonKey(key: string): boolean {
  return key.length > 0;
}

export function validateSupabaseEnv(): SupabaseEnvValidationResult {
  const url = environmentConfig.supabaseUrl;
  const anonKey = environmentConfig.supabaseAnonKey;

  if (!url) {
    return {
      valid: false,
      error: `Missing Supabase URL. Set the ${SUPABASE_CONFIG.URL_ENV_KEY} environment variable.`,
      url: '',
      anonKey: '',
    };
  }

  if (!isValidUrl(url)) {
    return {
      valid: false,
      error: `Invalid Supabase URL: "${url}". Expected a valid http(s) URL.`,
      url,
      anonKey,
    };
  }

  if (!anonKey) {
    return {
      valid: false,
      error: `Missing Supabase anon key. Set the ${SUPABASE_CONFIG.ANON_KEY_ENV_KEY} environment variable.`,
      url,
      anonKey: '',
    };
  }

  if (!isValidAnonKey(anonKey)) {
    return {
      valid: false,
      error: 'Invalid Supabase anon key: key is empty or malformed.',
      url,
      anonKey,
    };
  }

  return { valid: true, error: null, url, anonKey };
}
