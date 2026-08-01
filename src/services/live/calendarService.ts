import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { CalendarEvent, LiveClassFilter } from './live.types';
import { mapCalendarEventRow, isToday } from './liveHelpers';

export const calendarService = {
  async getEvents(filter?: LiveClassFilter): Promise<{ data: CalendarEvent[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('live_classes').select('id, title, description, start_time, end_time, timezone, status, provider_type, meeting_url, batch_id');

      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.batchId) query = query.eq('batch_id', filter.batchId);
      if (filter?.providerType) query = query.eq('provider_type', filter.providerType);
      if (filter?.hostId) query = query.eq('host_id', filter.hostId);
      if (filter?.startDate) query = query.gte('start_time', filter.startDate);
      if (filter?.endDate) query = query.lte('start_time', filter.endDate);
      if (filter?.search) query = query.ilike('title', `%${filter.search}%`);

      query = query.order('start_time', { ascending: true });

      const { data, error } = await query;
      if (error) { logger.error('calendarService.getEvents', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapCalendarEventRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getUpcoming(limit: number = 10): Promise<{ data: CalendarEvent[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('live_classes')
        .select('id, title, description, start_time, end_time, timezone, status, provider_type, meeting_url, batch_id')
        .gte('start_time', now)
        .in('status', ['scheduled', 'live'])
        .order('start_time', { ascending: true })
        .limit(limit);
      if (error) { logger.error('calendarService.getUpcoming', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapCalendarEventRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getTodays(): Promise<{ data: CalendarEvent[]; error: string | null }> {
    try {
      const { data: events, error } = await this.getEvents();
      if (error) return { data: [], error };
      return { data: events.filter((e) => isToday(e.startTime)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByDateRange(startDate: string, endDate: string): Promise<{ data: CalendarEvent[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes')
        .select('id, title, description, start_time, end_time, timezone, status, provider_type, meeting_url, batch_id')
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true });
      if (error) { logger.error('calendarService.getByDateRange', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapCalendarEventRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};