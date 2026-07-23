import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { supabaseConfig } from '@/config/supabase';
import { validateSupabaseEnv } from './env';
import { logger } from '@/lib/logger';

let client: SupabaseClientType | null = null;

export function getSupabaseClient(): SupabaseClientType {
  if (client) return client;

  const validation = validateSupabaseEnv();
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Supabase environment validation failed');
  }

  logger.info('Initializing Supabase client', { url: supabaseConfig.url });

  client = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      persistSession: supabaseConfig.options.auth.persistSession,
      autoRefreshToken: supabaseConfig.options.auth.autoRefreshToken,
      detectSessionInUrl: supabaseConfig.options.auth.detectSessionInUrl,
      flowType: supabaseConfig.options.auth.flowType,
    },
    realtime: {
      params: {
        eventsPerSecond: supabaseConfig.options.realtime.params.eventsPerSecond,
      },
    },
  });

  return client;
}

export function resetSupabaseClient(): void {
  client = null;
  logger.debug('Supabase client reset');
}

export type SupabaseClient = SupabaseClientType;
