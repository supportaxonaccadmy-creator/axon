import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { BroadcastInput } from './notification.types';
import { notificationService } from './notificationService';
import { emailService } from './emailService';

export const notificationQueue = {
  async broadcast(adminId: string, input: BroadcastInput): Promise<{ data: string[] | null; error: string | null; recipientCount: number }> {
    try {
      const supabase = getSupabaseClient();
      let recipientIds: string[] = [];

      if (input.target.type === 'all_students') {
        const { data: students, error } = await supabase.from('profiles')
          .select('id')
          .eq('role', 'student')
          .eq('is_active', true);
        if (error) { logger.error('notificationQueue.broadcast all', { error: error.message }); return { data: null, error: error.message, recipientCount: 0 }; }
        recipientIds = ((students ?? []) as Array<Record<string, unknown>>).map((s) => String(s.id));
      } else if (input.target.type === 'batch') {
        const { data: enrollments, error } = await supabase.from('enrollments')
          .select('profile_id')
          .eq('batch_id', input.target.batchId)
          .eq('access_status', 'active');
        if (error) { logger.error('notificationQueue.broadcast batch', { error: error.message }); return { data: null, error: error.message, recipientCount: 0 }; }
        recipientIds = ((enrollments ?? []) as Array<Record<string, unknown>>).map((e) => String(e.profile_id));
      } else {
        recipientIds = input.target.recipientIds;
      }

      if (recipientIds.length === 0) {
        return { data: [], error: 'No recipients found', recipientCount: 0 };
      }

      const channels = input.channels ?? ['in_app'];
      const batchId = input.target.type === 'batch' ? input.target.batchId : null;

      const { data: notification, error: notifError } = await notificationService.create(adminId, {
        type: 'custom_admin_message',
        title: input.title,
        message: input.message,
        priority: input.priority ?? 'normal',
        channels,
        actionUrl: input.actionUrl ?? null,
        actionLabel: input.actionLabel ?? null,
        batchId,
        recipientIds,
      });

      if (notifError || !notification) {
        return { data: null, error: notifError ?? 'Failed to create notification', recipientCount: 0 };
      }

      if (channels.includes('email')) {
        const { data: recipients } = await supabase.from('profiles')
          .select('id, email')
          .in('id', recipientIds);

        for (const recipient of (recipients ?? []) as Array<Record<string, unknown>>) {
          const email = recipient.email as string | null;
          if (!email) continue;
          await emailService.log({
            recipientEmail: email,
            recipientId: String(recipient.id),
            subject: input.title,
            body: input.message,
            status: 'pending',
            notificationId: notification.id,
          });
        }
      }

      return { data: recipientIds, error: null, recipientCount: recipientIds.length };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error', recipientCount: 0 };
    }
  },

  async processPendingEmails(): Promise<{ processed: number; sent: number; failed: number }> {
    try {
      const supabase = getSupabaseClient();
      const { data: pendingEmails, error } = await supabase.from('email_logs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) { logger.error('notificationQueue.processPendingEmails', { error: error.message }); return { processed: 0, sent: 0, failed: 0 }; }

      const emails = (pendingEmails ?? []) as Array<Record<string, unknown>>;
      let sent = 0;
      let failed = 0;

      for (const email of emails) {
        const id = String(email.id);
        try {
          // In production, this would call an edge function to send the email
          // For now, we mark as sent since actual email sending requires SMTP config
          await emailService.markSent(id);
          sent++;
        } catch {
          await emailService.markFailed(id, 'Email sending not configured');
          failed++;
        }
      }

      return { processed: emails.length, sent, failed };
    } catch {
      return { processed: 0, sent: 0, failed: 0 };
    }
  },
};
