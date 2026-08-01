import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { CertificateTemplate, CreateTemplateInput } from './gamification.types';
import { mapTemplateRow } from './gamificationHelpers';

export const certificateTemplateService = {
  async getAll(): Promise<{ data: CertificateTemplate[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificate_templates')
        .select('*').order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapTemplateRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getById(id: string): Promise<{ data: CertificateTemplate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificate_templates').select('*').eq('id', id).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapTemplateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(adminId: string, input: CreateTemplateInput): Promise<{ data: CertificateTemplate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificate_templates').insert({
        name: input.name,
        description: input.description ?? null,
        background_url: input.backgroundUrl ?? null,
        logo_url: input.logoUrl ?? null,
        signature_url: input.signatureUrl ?? null,
        stamp_url: input.stampUrl ?? null,
        template_config: input.templateConfig ?? {},
        created_by: adminId,
      }).select('*').maybeSingle();
      if (error) { logger.error('certificateTemplateService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapTemplateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: Partial<CreateTemplateInput>): Promise<{ data: CertificateTemplate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.backgroundUrl !== undefined) updateData.background_url = input.backgroundUrl;
      if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;
      if (input.signatureUrl !== undefined) updateData.signature_url = input.signatureUrl;
      if (input.stampUrl !== undefined) updateData.stamp_url = input.stampUrl;
      if (input.templateConfig !== undefined) updateData.template_config = input.templateConfig;
      const { data, error } = await supabase.from('certificate_templates').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('certificateTemplateService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapTemplateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('certificate_templates').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async toggleActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('certificate_templates').update({ is_active: isActive }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};