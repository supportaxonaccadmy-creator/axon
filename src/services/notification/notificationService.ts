import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  Notification, NotificationWithRecipient, NotificationRecipient,
  CreateNotificationInput, NotificationFilter, NotificationStats,
} from './notification.types';
import { mapNotificationRow, mapRecipientRow } from './notificationHelpers';

export const notificationService = {
  async create(adminId: string, input: CreateNotificationInput): Promise<{ data: Notification | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: notifRow, error: notifError } = await supabase.from('notifications').insert({
        type: input.type,
        title: input.title,
        message: input.message,
        priority: input.priority ?? 'normal',
        channels: input.channels ?? ['in_app'],
        action_url: input.actionUrl ?? null,
        action_label: input.actionLabel ?? null,
        batch_id: input.batchId ?? null,
        created_by: adminId,
        scheduled_for: input.scheduledFor ?? null,
      }).select('*').maybeSingle();

      if (notifError) { logger.error('notificationService.create', { error: notifError.message }); return { data: null, error: notifError.message }; }
      if (!notifRow) return { data: null, error: 'Failed to create notification' };

      const notification = mapNotificationRow(notifRow as Record<string, unknown>);
      const recipientInserts = input.recipientIds.map((rid) => ({
        notification_id: notification.id,
        recipient_id: rid,
      }));

      if (recipientInserts.length > 0) {
        const { error: recipError } = await supabase.from('notification_recipients').insert(recipientInserts);
        if (recipError) { logger.error('notificationService.create recipients', { error: recipError.message }); return { data: notification, error: recipError.message }; }
      }

      return { data: notification, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getForStudent(studentId: string, filter?: NotificationFilter): Promise<{ data: NotificationWithRecipient[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('notification_recipients')
        .select('*, notifications(*)')
        .eq('recipient_id', studentId)
        .order('created_at', { ascending: false });

      if (filter?.isRead !== null && filter?.isRead !== undefined) {
        query = query.eq('is_read', filter.isRead);
      }
      if (filter?.limit) query = query.limit(filter.limit);
      if (filter?.offset) query = query.range(filter.offset, filter.offset + (filter.limit ?? 20) - 1);

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };

      let results: NotificationWithRecipient[] = (data ?? []).map((row) => {
        const r = row as Record<string, unknown>;
        const notifData = r.notifications as Record<string, unknown>;
        const notif = mapNotificationRow(notifData);
        return {
          ...notif,
          recipientId: String(r.recipient_id),
          isRead: Boolean(r.is_read),
          readAt: (r.read_at as string | null) ?? null,
        };
      });

      if (filter?.type) {
        results = results.filter((n) => n.type === filter.type);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        results = results.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
      }

      return { data: results, error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getUnreadCount(studentId: string): Promise<{ data: number; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { count, error } = await supabase.from('notification_recipients')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', studentId)
        .eq('is_read', false);

      if (error) return { data: 0, error: error.message };
      return { data: count ?? 0, error: null };
    } catch (err) {
      return { data: 0, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markAsRead(recipientId: string, notificationId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('notification_recipients')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', recipientId)
        .eq('notification_id', notificationId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markAllAsRead(studentId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('notification_recipients')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', studentId)
        .eq('is_read', false);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async deleteNotification(studentId: string, notificationId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('notification_recipients')
        .delete()
        .eq('recipient_id', studentId)
        .eq('notification_id', notificationId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStats(studentId: string): Promise<{ data: NotificationStats | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: allRecipients, error } = await supabase.from('notification_recipients')
        .select('*, notifications(*)')
        .eq('recipient_id', studentId)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error: error.message };

      const recipients = (allRecipients ?? []) as Array<Record<string, unknown>>;
      const total = recipients.length;
      const unread = recipients.filter((r) => r.is_read === false).length;
      const byType: Record<string, number> = {};

      const recent: NotificationWithRecipient[] = recipients.slice(0, 10).map((r) => {
        const notifData = r.notifications as Record<string, unknown>;
        const notif = mapNotificationRow(notifData);
        byType[notif.type] = (byType[notif.type] ?? 0) + 1;
        return {
          ...notif,
          recipientId: String(r.recipient_id),
          isRead: Boolean(r.is_read),
          readAt: (r.read_at as string | null) ?? null,
        };
      });

      return { data: { total, unread, byType, recent }, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAllForAdmin(limit: number = 50, offset: number = 0): Promise<{ data: Notification[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapNotificationRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getRecipients(notificationId: string): Promise<{ data: NotificationRecipient[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('notification_recipients')
        .select('*')
        .eq('notification_id', notificationId);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRecipientRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(notificationId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  subscribeToUnreadCount(studentId: string, callback: (count: number) => void): () => void {
    const supabase = getSupabaseClient();
    const channel = supabase.channel(`notification_recipients:student:${studentId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notification_recipients', filter: `recipient_id=eq.${studentId}` },
        () => { void this.getUnreadCount(studentId).then(({ data }) => callback(data)); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
};
