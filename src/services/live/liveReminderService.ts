import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LiveReminder, CreateReminderInput, ReminderType } from './live.types';
import { mapReminderRow } from './liveHelpers';

export const liveReminderService = {
  async create(input: CreateReminderInput): Promise<{ data: LiveReminder | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_reminders').insert({
        live_class_id: input.liveClassId,
        reminder_type: input.reminderType,
        scheduled_for: input.scheduledFor,
        status: 'pending',
      }).select('*').maybeSingle();
      if (error) { logger.error('liveReminderService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapReminderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async createDefaultReminders(liveClassId: string, startTime: string): Promise<{ data: LiveReminder[]; error: string | null }> {
    try {
      const start = new Date(startTime);
      const reminders: Array<{ reminderType: ReminderType; scheduledFor: string }> = [];

      const h24 = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      if (h24 > new Date()) {
        reminders.push({ reminderType: '24h', scheduledFor: h24.toISOString() });
      }

      const h1 = new Date(start.getTime() - 60 * 60 * 1000);
      if (h1 > new Date()) {
        reminders.push({ reminderType: '1h', scheduledFor: h1.toISOString() });
      }

      const m15 = new Date(start.getTime() - 15 * 60 * 1000);
      if (m15 > new Date()) {
        reminders.push({ reminderType: '15min', scheduledFor: m15.toISOString() });
      }

      reminders.push({ reminderType: 'started', scheduledFor: start.toISOString() });

      const supabase = getSupabaseClient();
      const rows = reminders.map((r) => ({
        live_class_id: liveClassId,
        reminder_type: r.reminderType,
        scheduled_for: r.scheduledFor,
        status: 'pending' as const,
      }));

      const { data, error } = await supabase.from('live_reminders').insert(rows).select('*');
      if (error) { logger.error('liveReminderService.createDefaultReminders', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapReminderRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByLiveClass(liveClassId: string): Promise<{ data: LiveReminder[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_reminders').select('*').eq('live_class_id', liveClassId).order('scheduled_for', { ascending: true });
      if (error) { logger.error('liveReminderService.getByLiveClass', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapReminderRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getPending(): Promise<{ data: LiveReminder[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_reminders').select('*').eq('status', 'pending').order('scheduled_for', { ascending: true });
      if (error) { logger.error('liveReminderService.getPending', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapReminderRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markSent(id: string): Promise<{ data: LiveReminder | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_reminders').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      }).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('liveReminderService.markSent', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapReminderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markFailed(id: string, errorMessage: string): Promise<{ data: LiveReminder | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_reminders').update({
        status: 'failed',
        error_message: errorMessage,
      }).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('liveReminderService.markFailed', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapReminderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_reminders').delete().eq('id', id);
      if (error) { logger.error('liveReminderService.delete', { error: error.message }); return { error: error.message }; }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};