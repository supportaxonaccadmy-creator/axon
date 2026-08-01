import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { EmailLog, EmailStatus } from './notification.types';
import { mapEmailLogRow } from './notificationHelpers';

export const emailService = {
  async log(input: {
    recipientEmail: string;
    recipientId?: string | null;
    subject: string;
    body: string;
    status?: EmailStatus;
    errorMessage?: string | null;
    notificationId?: string | null;
    templateId?: string | null;
  }): Promise<{ data: EmailLog | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('email_logs').insert({
        recipient_email: input.recipientEmail,
        recipient_id: input.recipientId ?? null,
        subject: input.subject,
        body: input.body,
        status: input.status ?? 'pending',
        error_message: input.errorMessage ?? null,
        notification_id: input.notificationId ?? null,
        template_id: input.templateId ?? null,
        sent_at: input.status === 'sent' ? new Date().toISOString() : null,
      }).select('*').maybeSingle();

      if (error) { logger.error('emailService.log', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapEmailLogRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getLogs(limit: number = 50, offset: number = 0, statusFilter?: EmailStatus | null): Promise<{ data: EmailLog[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (statusFilter) query = query.eq('status', statusFilter);

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapEmailLogRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markSent(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('email_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
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
      const { error } = await supabase.from('email_logs')
        .update({ status: 'failed', error_message: errorMessage })
        .eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async retry(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: log, error: fetchError } = await supabase.from('email_logs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError || !log) return { error: fetchError?.message ?? 'Email log not found' };

      const logRow = log as Record<string, unknown>;
      const { error: updateError } = await supabase.from('email_logs')
        .update({
          status: 'pending',
          error_message: null,
          retry_count: Number(logRow.retry_count ?? 0) + 1,
        })
        .eq('id', id);

      if (updateError) return { error: updateError.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getFailedCount(): Promise<{ data: number; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { count, error } = await supabase.from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');
      if (error) return { data: 0, error: error.message };
      return { data: count ?? 0, error: null };
    } catch (err) {
      return { data: 0, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStats(): Promise<{ data: { total: number; sent: number; failed: number; pending: number }; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: logs, error } = await supabase.from('email_logs').select('status');
      if (error) return { data: { total: 0, sent: 0, failed: 0, pending: 0 }, error: error.message };

      const allLogs = (logs ?? []) as Array<Record<string, unknown>>;
      const total = allLogs.length;
      const sent = allLogs.filter((l) => l.status === 'sent').length;
      const failed = allLogs.filter((l) => l.status === 'failed').length;
      const pending = allLogs.filter((l) => l.status === 'pending').length;

      return { data: { total, sent, failed, pending }, error: null };
    } catch (err) {
      return { data: { total: 0, sent: 0, failed: 0, pending: 0 }, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
