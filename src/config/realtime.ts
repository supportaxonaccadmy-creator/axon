import { SUPABASE_CONFIG } from '@/constants/supabase';

export const realtimeConfig = {
  eventsPerSecond: SUPABASE_CONFIG.REALTIME.EVENTS_PER_SECOND,
  reconnectDelayMs: SUPABASE_CONFIG.REALTIME.RECONNECT_DELAY_MS,
  maxReconnectAttempts: SUPABASE_CONFIG.REALTIME.MAX_RECONNECT_ATTEMPTS,
  enabled: true,
} as const;
