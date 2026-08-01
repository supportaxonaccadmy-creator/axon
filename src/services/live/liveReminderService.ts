import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LiveReminder, ReminderType, CreateReminderInput } from './live.types';
import { mapReminderRow } from './liveHelpers';

export const liveReminderService = {
  async create(input: CreateReminderInput): Promise<{ data: LiveReminder | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_reminders').insert({
        live_class_id: input.liveClassId,
        reminder_type: input.reminderType,
        scheduled_for: input.scheduledFor,
      }).select('*').maybeSingle();

      if (error) { logger.error('liveReminderService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapReminderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async createDefaultReminders(liveClassId: string, startTime: string): Promise<{ error: string | null }> {
    try {
      const start = new Date(startTime);
      const reminderTypes: Array<{ type: ReminderType; offsetMs: number }> = [
        { type: '24h', offsetMs: -24 * 60 * 60 * 1000 },
        { type: '1h', offsetMs: -60 * 60 * 1000 },
        { type: '15min', offsetMs: -15 * 60 * 1000 },
      ];

      for (const { type, offsetMs } of reminderTypes) {
        const scheduledFor = new Date(start.getTime() + offsetMs);
        if (scheduledFor > new Date()) {
          const { error } = await this.create({
            liveClassId,
            reminderType: type,
            scheduledFor: scheduledFor.toISOString(),
          });
          if (error) logger.warn('liveReminderService.createDefaultReminders', { type, error });
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByLiveClass(liveClassId: string): Promise<{ data: LiveReminder[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_reminders')
        .select('*')
        .eq('live_class_id', liveClassId)
        .order('scheduled_for', { ascending: true });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapReminderRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markSent(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_reminders')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markFailed(id: string, errorMessage: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_reminders')
        .update({ status: 'failed', error_message: errorMessage })
        .eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getPendingReminders(): Promise<{ data: LiveReminder[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('live_reminders')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', now)
        .order('scheduled_for', { ascending: true })
        .limit(50);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapReminderRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async deleteByLiveClass(liveClassId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_reminders')
        .delete()
        .eq('live_class_id', liveClassId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
