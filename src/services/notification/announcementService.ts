import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Announcement, CreateAnnouncementInput } from './notification.types';
import { mapAnnouncementRow } from './notificationHelpers';

export const announcementService = {
  async create(adminId: string, input: CreateAnnouncementInput): Promise<{ data: Announcement | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('announcements').insert({
        title: input.title,
        body: input.body,
        image_url: input.imageUrl ?? null,
        is_pinned: input.isPinned ?? false,
        is_global: input.isGlobal ?? false,
        batch_id: input.batchId ?? null,
        status: input.status ?? 'draft',
        scheduled_for: input.scheduledFor ?? null,
        expires_at: input.expiresAt ?? null,
        created_by: adminId,
      }).select('*').maybeSingle();

      if (error) { logger.error('announcementService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapAnnouncementRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: Partial<CreateAnnouncementInput>): Promise<{ data: Announcement | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.body !== undefined) updateData.body = input.body;
      if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
      if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned;
      if (input.isGlobal !== undefined) updateData.is_global = input.isGlobal;
      if (input.batchId !== undefined) updateData.batch_id = input.batchId;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.scheduledFor !== undefined) updateData.scheduled_for = input.scheduledFor;
      if (input.expiresAt !== undefined) updateData.expires_at = input.expiresAt;

      const { data, error } = await supabase.from('announcements').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('announcementService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapAnnouncementRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(limit: number = 50, offset: number = 0): Promise<{ data: Announcement[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapAnnouncementRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getForStudent(studentId: string, limit: number = 20): Promise<{ data: Announcement[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: enrollments } = await supabase.from('enrollments')
        .select('batch_id')
        .eq('profile_id', studentId);
      const batchIds = ((enrollments ?? []) as Array<Record<string, unknown>>).map((e) => String(e.batch_id));

      let query = supabase.from('announcements')
        .select('*')
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };

      let announcements = (data ?? []).map((r) => mapAnnouncementRow(r as Record<string, unknown>));
      announcements = announcements.filter((a) => {
        if (a.isGlobal || a.batchId === null) return true;
        return batchIds.includes(a.batchId);
      });

      const now = new Date();
      announcements = announcements.filter((a) => {
        if (a.expiresAt && new Date(a.expiresAt) < now) return false;
        if (a.scheduledFor && new Date(a.scheduledFor) > now) return false;
        return true;
      });

      return { data: announcements, error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getById(id: string): Promise<{ data: Announcement | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('announcements').select('*').eq('id', id).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapAnnouncementRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async togglePin(id: string, isPinned: boolean): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('announcements').update({ is_pinned: isPinned }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async publish(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('announcements').update({ status: 'published' }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async archive(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('announcements').update({ status: 'archived' }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
