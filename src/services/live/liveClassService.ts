import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LiveClass, CreateLiveClassInput, UpdateLiveClassInput, LiveClassFilter, LiveClassStats } from './live.types';
import { mapLiveClassRow } from './liveHelpers';

export const liveClassService = {
  async create(adminId: string, input: CreateLiveClassInput): Promise<{ data: LiveClass | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').insert({
        title: input.title,
        description: input.description ?? null,
        provider_type: input.providerType,
        meeting_url: input.meetingUrl,
        meeting_password: input.meetingPassword ?? null,
        meeting_id: input.meetingId ?? null,
        batch_id: input.batchId,
        subject_id: input.subjectId ?? null,
        chapter_id: input.chapterId ?? null,
        class_id: input.classId ?? null,
        thumbnail_url: input.thumbnailUrl ?? null,
        banner_url: input.bannerUrl ?? null,
        start_time: input.startTime,
        end_time: input.endTime,
        timezone: input.timezone ?? 'UTC',
        recurring: input.recurring ?? 'none',
        recurring_interval: input.recurringInterval ?? null,
        recurring_end_date: input.recurringEndDate ?? null,
        waiting_room: input.waitingRoom ?? false,
        max_participants: input.maxParticipants ?? null,
        allow_recording: input.allowRecording ?? true,
        auto_recording: input.autoRecording ?? false,
        host_controls: input.hostControls ?? {},
        created_by: adminId,
      }).select('*').maybeSingle();

      if (error) { logger.error('liveClassService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapLiveClassRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: UpdateLiveClassInput): Promise<{ data: LiveClass | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.providerType !== undefined) updateData.provider_type = input.providerType;
      if (input.meetingUrl !== undefined) updateData.meeting_url = input.meetingUrl;
      if (input.meetingPassword !== undefined) updateData.meeting_password = input.meetingPassword;
      if (input.meetingId !== undefined) updateData.meeting_id = input.meetingId;
      if (input.batchId !== undefined) updateData.batch_id = input.batchId;
      if (input.subjectId !== undefined) updateData.subject_id = input.subjectId;
      if (input.chapterId !== undefined) updateData.chapter_id = input.chapterId;
      if (input.classId !== undefined) updateData.class_id = input.classId;
      if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = input.thumbnailUrl;
      if (input.bannerUrl !== undefined) updateData.banner_url = input.bannerUrl;
      if (input.startTime !== undefined) updateData.start_time = input.startTime;
      if (input.endTime !== undefined) updateData.end_time = input.endTime;
      if (input.timezone !== undefined) updateData.timezone = input.timezone;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.recurring !== undefined) updateData.recurring = input.recurring;
      if (input.recurringInterval !== undefined) updateData.recurring_interval = input.recurringInterval;
      if (input.recurringEndDate !== undefined) updateData.recurring_end_date = input.recurringEndDate;
      if (input.waitingRoom !== undefined) updateData.waiting_room = input.waitingRoom;
      if (input.maxParticipants !== undefined) updateData.max_participants = input.maxParticipants;
      if (input.allowRecording !== undefined) updateData.allow_recording = input.allowRecording;
      if (input.autoRecording !== undefined) updateData.auto_recording = input.autoRecording;
      if (input.hostControls !== undefined) updateData.host_controls = input.hostControls;

      const { data, error } = await supabase.from('live_classes').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('liveClassService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapLiveClassRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_classes').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getById(id: string): Promise<{ data: LiveClass | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').select('*').eq('id', id).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapLiveClassRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(filter?: LiveClassFilter): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('live_classes').select('*').order('start_time', { ascending: false });

      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.batchId) query = query.eq('batch_id', filter.batchId);
      if (filter?.providerType) query = query.eq('provider_type', filter.providerType);
      if (filter?.startDate) query = query.gte('start_time', filter.startDate);
      if (filter?.endDate) query = query.lte('start_time', filter.endDate);

      const limit = filter?.limit ?? 50;
      const offset = filter?.offset ?? 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };

      let results = (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>));
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        results = results.filter((c) => c.title.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));
      }

      return { data: results, error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getForStudent(studentId: string, filter?: LiveClassFilter): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: enrollments, error: enrollError } = await supabase.from('enrollments')
        .select('batch_id')
        .eq('profile_id', studentId)
        .eq('access_status', 'active');
      if (enrollError) return { data: [], error: enrollError.message };

      const batchIds = ((enrollments ?? []) as Array<Record<string, unknown>>).map((e) => String(e.batch_id));
      if (batchIds.length === 0) return { data: [], error: null };

      let query = supabase.from('live_classes')
        .select('*')
        .in('batch_id', batchIds)
        .order('start_time', { ascending: false });

      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.providerType) query = query.eq('provider_type', filter.providerType);
      if (filter?.startDate) query = query.gte('start_time', filter.startDate);
      if (filter?.endDate) query = query.lte('start_time', filter.endDate);

      const limit = filter?.limit ?? 50;
      const offset = filter?.offset ?? 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };

      let results = (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>));
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        results = results.filter((c) => c.title.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));
      }

      return { data: results, error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStats(): Promise<{ data: LiveClassStats | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').select('status');
      if (error) return { data: null, error: error.message };

      const all = (data ?? []) as Array<Record<string, unknown>>;
      const total = all.length;
      const scheduled = all.filter((r) => r.status === 'scheduled').length;
      const live = all.filter((r) => r.status === 'live').length;
      const completed = all.filter((r) => r.status === 'completed').length;
      const cancelled = all.filter((r) => r.status === 'cancelled').length;

      return { data: { total, scheduled, live, completed, cancelled, totalParticipants: 0, averageAttendance: 0 }, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async updateStatus(id: string, status: import('./live.types').LiveClassStatus): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_classes').update({ status }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async duplicate(id: string, adminId: string): Promise<{ data: LiveClass | null; error: string | null }> {
    try {
      const { data: original, error: fetchError } = await this.getById(id);
      if (fetchError || !original) return { data: null, error: fetchError ?? 'Not found' };

      const input: CreateLiveClassInput = {
        title: `${original.title} (Copy)`,
        description: original.description,
        providerType: original.providerType,
        meetingUrl: original.meetingUrl,
        meetingPassword: original.meetingPassword,
        meetingId: original.meetingId,
        batchId: original.batchId ?? '',
        subjectId: original.subjectId,
        chapterId: original.chapterId,
        classId: original.classId,
        thumbnailUrl: original.thumbnailUrl,
        bannerUrl: original.bannerUrl,
        startTime: original.startTime,
        endTime: original.endTime,
        timezone: original.timezone,
        recurring: original.recurring,
        recurringInterval: original.recurringInterval,
        recurringEndDate: original.recurringEndDate,
        waitingRoom: original.waitingRoom,
        maxParticipants: original.maxParticipants,
        allowRecording: original.allowRecording,
        autoRecording: original.autoRecording,
        hostControls: original.hostControls,
      };

      return this.create(adminId, input);
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  subscribeToLiveClasses(callback: () => void): () => void {
    const supabase = getSupabaseClient();
    const channel = supabase.channel('live_classes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => callback())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};
