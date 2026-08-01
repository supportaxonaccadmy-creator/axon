import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { MeetingProvider, MeetingProviderType } from './live.types';
import { mapProviderRow } from './liveHelpers';

export const meetingProviderService = {
  async getAll(): Promise<{ data: MeetingProvider[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('meeting_providers').select('*').order('name');
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapProviderRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByType(providerType: MeetingProviderType): Promise<{ data: MeetingProvider | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('meeting_providers').select('*').eq('provider_type', providerType).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapProviderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(input: { name: string; providerType: MeetingProviderType; apiKey?: string | null; apiSecret?: string | null; serverUrl?: string | null; defaultSettings?: Record<string, unknown> }): Promise<{ data: MeetingProvider | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('meeting_providers').insert({
        name: input.name,
        provider_type: input.providerType,
        api_key: input.apiKey ?? null,
        api_secret: input.apiSecret ?? null,
        server_url: input.serverUrl ?? null,
        default_settings: input.defaultSettings ?? {},
      }).select('*').maybeSingle();
      if (error) { logger.error('meetingProviderService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapProviderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: Partial<{ name: string; apiKey: string | null; apiSecret: string | null; serverUrl: string | null; defaultSettings: Record<string, unknown>; isActive: boolean }>): Promise<{ data: MeetingProvider | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.apiKey !== undefined) updateData.api_key = input.apiKey;
      if (input.apiSecret !== undefined) updateData.api_secret = input.apiSecret;
      if (input.serverUrl !== undefined) updateData.server_url = input.serverUrl;
      if (input.defaultSettings !== undefined) updateData.default_settings = input.defaultSettings;
      if (input.isActive !== undefined) updateData.is_active = input.isActive;

      const { data, error } = await supabase.from('meeting_providers').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('meetingProviderService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapProviderRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('meeting_providers').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async toggleActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('meeting_providers').update({ is_active: isActive }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
