import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { subscribeToTable, unsubscribeChannel } from '@/lib/helpers/realtimeHelpers';
import type {
  LiveClass, CreateLiveClassInput, UpdateLiveClassInput,
  LiveClassFilter, LiveClassStatus, MeetingProviderType,
} from './live.types';
import { mapLiveClassRow } from './liveHelpers';

export const liveClassService = {
  async getById(id: string): Promise<{ data: LiveClass | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').select('*').eq('id', id).maybeSingle();
      if (error) { logger.error('liveClassService.getById', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapLiveClassRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(filter?: LiveClassFilter): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('live_classes').select('*');

      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.batchId) query = query.eq('batch_id', filter.batchId);
      if (filter?.providerType) query = query.eq('provider_type', filter.providerType);
      if (filter?.hostId) query = query.eq('host_id', filter.hostId);
      if (filter?.startDate) query = query.gte('start_time', filter.startDate);
      if (filter?.endDate) query = query.lte('start_time', filter.endDate);
      if (filter?.search) query = query.ilike('title', `%${filter.search}%`);

      query = query.order('start_time', { ascending: false });

      const { data, error } = await query;
      if (error) { logger.error('liveClassService.getAll', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByBatch(batchId: string): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').select('*').eq('batch_id', batchId).order('start_time', { ascending: false });
      if (error) { logger.error('liveClassService.getByBatch', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByHost(hostId: string): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').select('*').eq('host_id', hostId).order('start_time', { ascending: false });
      if (error) { logger.error('liveClassService.getByHost', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStatus(status: LiveClassStatus): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').select('*').eq('status', status).order('start_time', { ascending: false });
      if (error) { logger.error('liveClassService.getByStatus', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(input: CreateLiveClassInput): Promise<{ data: LiveClass | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').insert({
        title: input.title,
        description: input.description ?? null,
        provider_type: input.providerType,
        meeting_url: input.meetingUrl ?? null,
        meeting_password: input.meetingPassword ?? null,
        meeting_id: input.meetingId ?? null,
        host_id: input.hostId ?? null,
        batch_id: input.batchId ?? null,
        subject_id: input.subjectId ?? null,
        chapter_id: input.chapterId ?? null,
        class_id: input.classId ?? null,
        thumbnail_url: input.thumbnailUrl ?? null,
        banner_url: input.bannerUrl ?? null,
        start_time: input.startTime,
        end_time: input.endTime,
        timezone: input.timezone ?? 'UTC',
        status: input.status ?? 'scheduled',
        recurring: input.recurring ?? 'none',
        recurring_interval: input.recurringInterval ?? null,
        recurring_end_date: input.recurringEndDate ?? null,
        waiting_room: input.waitingRoom ?? false,
        max_participants: input.maxParticipants ?? null,
        allow_recording: input.allowRecording ?? false,
        auto_recording: input.autoRecording ?? false,
        host_controls: input.hostControls ?? null,
        created_by: input.createdBy ?? null,
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
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.providerType !== undefined) updateData.provider_type = input.providerType;
      if (input.meetingUrl !== undefined) updateData.meeting_url = input.meetingUrl;
      if (input.meetingPassword !== undefined) updateData.meeting_password = input.meetingPassword;
      if (input.meetingId !== undefined) updateData.meeting_id = input.meetingId;
      if (input.hostId !== undefined) updateData.host_id = input.hostId;
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

  async updateStatus(id: string, status: LiveClassStatus): Promise<{ data: LiveClass | null; error: string | null }> {
    return this.update(id, { status });
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_classes').delete().eq('id', id);
      if (error) { logger.error('liveClassService.delete', { error: error.message }); return { error: error.message }; }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async duplicate(id: string, newTitle?: string): Promise<{ data: LiveClass | null; error: string | null }> {
    try {
      const { data: original, error: fetchError } = await this.getById(id);
      if (fetchError || !original) return { data: null, error: fetchError ?? 'Live class not found' };

      const { data, error } = await this.create({
        title: newTitle ?? `${original.title} (Copy)`,
        description: original.description,
        providerType: original.providerType,
        meetingUrl: original.meetingUrl,
        meetingPassword: original.meetingPassword,
        meetingId: original.meetingId,
        hostId: original.hostId,
        batchId: original.batchId,
        subjectId: original.subjectId,
        chapterId: original.chapterId,
        classId: original.classId,
        thumbnailUrl: original.thumbnailUrl,
        bannerUrl: original.bannerUrl,
        startTime: original.startTime,
        endTime: original.endTime,
        timezone: original.timezone,
        status: 'scheduled',
        recurring: 'none',
        waitingRoom: original.waitingRoom,
        maxParticipants: original.maxParticipants,
        allowRecording: original.allowRecording,
        autoRecording: original.autoRecording,
        hostControls: original.hostControls,
        createdBy: original.createdBy,
      });
      if (error) return { data: null, error };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByProviderType(providerType: MeetingProviderType): Promise<{ data: LiveClass[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_classes').select('*').eq('provider_type', providerType).order('start_time', { ascending: false });
      if (error) { logger.error('liveClassService.getByProviderType', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapLiveClassRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  subscribeToChanges(callback: (payload: unknown) => void): () => void {
    subscribeToTable('live_classes_changes', 'live_classes', callback);
    return () => unsubscribeChannel('live_classes_changes');
  },
};