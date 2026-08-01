import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Badge, StudentBadge, CreateBadgeInput } from './gamification.types';
import { mapBadgeRow } from './gamificationHelpers';

export const badgeService = {
  async getAll(): Promise<{ data: Badge[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('badges')
        .select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapBadgeRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAllAdmin(): Promise<{ data: Badge[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('badges')
        .select('*').order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapBadgeRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStudent(studentId: string): Promise<{ data: StudentBadge[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('student_badges')
        .select('*, badges!student_badges_badge_id_fkey(*)')
        .eq('student_id', studentId).order('awarded_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return {
        data: (data ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          return {
            id: String(row.id),
            studentId: String(row.student_id),
            badgeId: String(row.badge_id),
            awardedAt: String(row.awarded_at),
            awardedBy: (row.awarded_by as string | null) ?? null,
            createdAt: String(row.created_at),
          };
        }),
        error: null,
      };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(_adminId: string, input: CreateBadgeInput): Promise<{ data: Badge | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('badges').insert({
        name: input.name,
        description: input.description ?? null,
        icon: input.icon ?? null,
        color: input.color ?? null,
        tier: input.tier ?? 'bronze',
      }).select('*').maybeSingle();
      if (error) { logger.error('badgeService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapBadgeRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: Partial<CreateBadgeInput>): Promise<{ data: Badge | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.tier !== undefined) updateData.tier = input.tier;
      const { data, error } = await supabase.from('badges').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('badgeService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapBadgeRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('badges').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async award(adminId: string, studentId: string, badgeId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('student_badges').insert({
        student_id: studentId,
        badge_id: badgeId,
        awarded_by: adminId,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};