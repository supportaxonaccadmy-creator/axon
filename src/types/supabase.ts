import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

export type SupabaseClient = SupabaseClientType;

export interface SupabaseErrorDetail {
  message: string;
  code: string | undefined;
  details: unknown;
  hint: string | undefined;
}

export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
  options: {
    auth: {
      persistSession: boolean;
      autoRefreshToken: boolean;
      detectSessionInUrl: boolean;
      flowType: 'implicit' | 'pkce';
    };
    realtime: {
      params: {
        eventsPerSecond: number;
      };
    };
  };
}
