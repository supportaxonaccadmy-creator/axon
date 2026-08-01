import { getSupabaseClient } from '@/lib/supabase';
import type { LiveClass, CalendarEvent } from './live.types';
import { mapLiveClassRow } from './liveHelpers';

export const calendarService = {
  async getEvents(startDate: string, endDate: string, isAdmin: boolean, studentId?: string): Promise<{ data: CalendarEvent[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('live_classes')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true });

      if (!isAdmin && studentId) {
        const { data: enrollments } = await supabase.from('enrollments')
          .select('batch_id')
          .eq('profile_id', studentId)
          .eq('access_status', 'active');
        const batchIds = ((enrollments ?? []) as Array<Record<string, unknown>>).map((e) => String(e.batch_id));
        if (batchIds.length === 0) return { data: [], error: null };
        query = query.in('batch_id', batchIds);
      }

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };

      const events: CalendarEvent[] = (data ?? []).map((r) => {
        const lc = mapLiveClassRow(r as Record<string, unknown>);
        return {
          id: lc.id,
          title: lc.title,
          start: lc.startTime,
          end: lc.endTime,
          status: lc.status,
          providerType: lc.providerType,
          batchId: lc.batchId,
        };
      });

      return { data: events, error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getUpcoming(isAdmin: boolean, studentId?: string, limit: number = 10): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const now = new Date().toISOString();
      let query = supabase.from('live_classes')
        .select('*')
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(limit);

      if (!isAdmin && studentId) {
        const { data: enrollments } = await supabase.from('enrollments')
          .select('batch_id')
          .eq('profile_id', studentId)
          .eq('access_status', 'active');
        const batchIds = ((enrollments ?? []) as Array<Record<string, unknown>>).map((e) => String(e.batch_id));
        if (batchIds.length === 0) return { data: [], error: null };
        query = query.in('batch_id', batchIds);
      }

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getTodays(isAdmin: boolean, studentId?: string): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      let query = supabase.from('live_classes')
        .select('*')
        .gte('start_time', startOfDay)
        .lt('start_time', endOfDay)
        .order('start_time', { ascending: true });

      if (!isAdmin && studentId) {
        const { data: enrollments } = await supabase.from('enrollments')
          .select('batch_id')
          .eq('profile_id', studentId)
          .eq('access_status', 'active');
        const batchIds = ((enrollments ?? []) as Array<Record<string, unknown>>).map((e) => String(e.batch_id));
        if (batchIds.length === 0) return { data: [], error: null };
        query = query.in('batch_id', batchIds);
      }

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
