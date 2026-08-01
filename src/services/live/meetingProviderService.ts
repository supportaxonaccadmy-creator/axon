import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  MeetingProvider, CreateMeetingProviderInput, UpdateMeetingProviderInput,
  MeetingProviderType,
} from './live.types';
import { mapMeetingProviderRow } from './liveHelpers';

export const meetingProviderService = {
  async getById(id: string): Promise<{ data: MeetingProvider | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('meeting_providers').select('*').eq('id', id).maybeSingle();
      if (error) { logger.error('meetingProviderService.getById', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapMeetingProviderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(): Promise<{ data: MeetingProvider[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('meeting_providers').select('*').order('created_at', { ascending: false });
      if (error) { logger.error('meetingProviderService.getAll', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapMeetingProviderRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getActive(): Promise<{ data: MeetingProvider[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('meeting_providers').select('*').eq('is_active', true).order('name', { ascending: true });
      if (error) { logger.error('meetingProviderService.getActive', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapMeetingProviderRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByType(providerType: MeetingProviderType): Promise<{ data: MeetingProvider | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('meeting_providers').select('*').eq('provider_type', providerType).eq('is_active', true).maybeSingle();
      if (error) { logger.error('meetingProviderService.getByType', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapMeetingProviderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(input: CreateMeetingProviderInput): Promise<{ data: MeetingProvider | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('meeting_providers').insert({
        name: input.name,
        provider_type: input.providerType,
        api_key: input.apiKey ?? null,
        api_secret: input.apiSecret ?? null,
        server_url: input.serverUrl ?? null,
        default_settings: input.defaultSettings ?? null,
        is_active: input.isActive ?? true,
      }).select('*').maybeSingle();
      if (error) { logger.error('meetingProviderService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapMeetingProviderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: UpdateMeetingProviderInput): Promise<{ data: MeetingProvider | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.name !== undefined) updateData.name = input.name;
      if (input.providerType !== undefined) updateData.provider_type = input.providerType;
      if (input.apiKey !== undefined) updateData.api_key = input.apiKey;
      if (input.apiSecret !== undefined) updateData.api_secret = input.apiSecret;
      if (input.serverUrl !== undefined) updateData.server_url = input.serverUrl;
      if (input.defaultSettings !== undefined) updateData.default_settings = input.defaultSettings;
      if (input.isActive !== undefined) updateData.is_active = input.isActive;

      const { data, error } = await supabase.from('meeting_providers').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('meetingProviderService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapMeetingProviderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('meeting_providers').delete().eq('id', id);
      if (error) { logger.error('meetingProviderService.delete', { error: error.message }); return { error: error.message }; }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async setActive(id: string, isActive: boolean): Promise<{ data: MeetingProvider | null; error: string | null }> {
    return this.update(id, { isActive });
  },
};