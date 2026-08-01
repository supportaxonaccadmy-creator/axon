import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LiveRecording, CreateRecordingInput } from './live.types';
import { mapRecordingRow } from './liveHelpers';

export const recordingService = {
  async create(adminId: string, input: CreateRecordingInput): Promise<{ data: LiveRecording | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings').insert({
        live_class_id: input.liveClassId ?? null,
        title: input.title,
        description: input.description ?? null,
        source: input.source,
        url: input.url,
        download_url: input.downloadUrl ?? null,
        thumbnail_url: input.thumbnailUrl ?? null,
        duration_seconds: input.durationSeconds ?? null,
        file_size_bytes: input.fileSizeBytes ?? null,
        batch_id: input.batchId ?? null,
        created_by: adminId,
      }).select('*').maybeSingle();

      if (error) { logger.error('recordingService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapRecordingRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: Partial<CreateRecordingInput>): Promise<{ data: LiveRecording | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.source !== undefined) updateData.source = input.source;
      if (input.url !== undefined) updateData.url = input.url;
      if (input.downloadUrl !== undefined) updateData.download_url = input.downloadUrl;
      if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = input.thumbnailUrl;
      if (input.durationSeconds !== undefined) updateData.duration_seconds = input.durationSeconds;
      if (input.fileSizeBytes !== undefined) updateData.file_size_bytes = input.fileSizeBytes;
      if (input.batchId !== undefined) updateData.batch_id = input.batchId;

      const { data, error } = await supabase.from('live_recordings').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('recordingService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapRecordingRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_recordings').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getById(id: string): Promise<{ data: LiveRecording | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings').select('*').eq('id', id).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapRecordingRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(limit: number = 50, offset: number = 0): Promise<{ data: LiveRecording[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRecordingRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByLiveClass(liveClassId: string): Promise<{ data: LiveRecording[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings')
        .select('*')
        .eq('live_class_id', liveClassId)
        .order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRecordingRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getForStudent(studentId: string, limit: number = 50): Promise<{ data: LiveRecording[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: enrollments } = await supabase.from('enrollments')
        .select('batch_id')
        .eq('profile_id', studentId)
        .eq('access_status', 'active');
      const batchIds = ((enrollments ?? []) as Array<Record<string, unknown>>).map((e) => String(e.batch_id));
      if (batchIds.length === 0) return { data: [], error: null };

      const { data, error } = await supabase.from('live_recordings')
        .select('*')
        .in('batch_id', batchIds)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRecordingRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByBatch(batchId: string, limit: number = 50): Promise<{ data: LiveRecording[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRecordingRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
