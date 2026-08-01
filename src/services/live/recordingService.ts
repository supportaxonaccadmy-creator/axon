import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LiveRecording, CreateRecordingInput, UpdateRecordingInput } from './live.types';
import { mapRecordingRow } from './liveHelpers';

export const recordingService = {
  async getById(id: string): Promise<{ data: LiveRecording | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings').select('*').eq('id', id).maybeSingle();
      if (error) { logger.error('recordingService.getById', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapRecordingRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByLiveClass(liveClassId: string): Promise<{ data: LiveRecording[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings').select('*').eq('live_class_id', liveClassId).order('created_at', { ascending: false });
      if (error) { logger.error('recordingService.getByLiveClass', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapRecordingRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByBatch(batchId: string): Promise<{ data: LiveRecording[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings').select('*').eq('batch_id', batchId).order('created_at', { ascending: false });
      if (error) { logger.error('recordingService.getByBatch', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapRecordingRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(): Promise<{ data: LiveRecording[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings').select('*').order('created_at', { ascending: false });
      if (error) { logger.error('recordingService.getAll', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapRecordingRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(input: CreateRecordingInput): Promise<{ data: LiveRecording | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_recordings').insert({
        live_class_id: input.liveClassId,
        title: input.title,
        description: input.description ?? null,
        source: input.source,
        url: input.url,
        download_url: input.downloadUrl ?? null,
        thumbnail_url: input.thumbnailUrl ?? null,
        duration_seconds: input.durationSeconds ?? null,
        file_size_bytes: input.fileSizeBytes ?? null,
        batch_id: input.batchId ?? null,
        created_by: input.createdBy ?? null,
      }).select('*').maybeSingle();
      if (error) { logger.error('recordingService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapRecordingRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: UpdateRecordingInput): Promise<{ data: LiveRecording | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.source !== undefined) updateData.source = input.source;
      if (input.url !== undefined) updateData.url = input.url;
      if (input.downloadUrl !== undefined) updateData.download_url = input.downloadUrl;
      if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = input.thumbnailUrl;
      if (input.durationSeconds !== undefined) updateData.duration_seconds = input.durationSeconds;
      if (input.fileSizeBytes !== undefined) updateData.file_size_bytes = input.fileSizeBytes;

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
      if (error) { logger.error('recordingService.delete', { error: error.message }); return { error: error.message }; }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};