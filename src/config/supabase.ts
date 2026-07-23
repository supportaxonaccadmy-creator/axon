import { SUPABASE_CONFIG } from '@/constants/supabase';
import { environmentConfig } from './runtime';

export const supabaseConfig = {
  url: environmentConfig.supabaseUrl,
  anonKey: environmentConfig.supabaseAnonKey,
  options: {
    auth: {
      persistSession: SUPABASE_CONFIG.AUTH.PERSIST_SESSION,
      autoRefreshToken: SUPABASE_CONFIG.AUTH.AUTO_REFRESH_TOKEN,
      detectSessionInUrl: SUPABASE_CONFIG.AUTH.DETECT_SESSION_IN_URL,
      flowType: SUPABASE_CONFIG.AUTH.FLOW_TYPE,
    },
    realtime: {
      params: {
        eventsPerSecond: SUPABASE_CONFIG.REALTIME.EVENTS_PER_SECOND,
      },
    },
  },
} as const;
