import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Achievement, StudentAchievement, CreateAchievementInput } from './gamification.types';
import { mapAchievementRow } from './gamificationHelpers';

export const achievementService = {
  async getAll(): Promise<{ data: Achievement[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('achievements')
        .select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapAchievementRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAllAdmin(): Promise<{ data: Achievement[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('achievements')
        .select('*').order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapAchievementRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStudent(studentId: string): Promise<{ data: StudentAchievement[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('student_achievements')
        .select('*, achievements!student_achievements_achievement_id_fkey(*)')
        .eq('student_id', studentId).order('awarded_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return {
        data: (data ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          return {
            id: String(row.id),
            studentId: String(row.student_id),
            achievementId: String(row.achievement_id),
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

  async create(_adminId: string, input: CreateAchievementInput): Promise<{ data: Achievement | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('achievements').insert({
        name: input.name,
        description: input.description ?? null,
        icon: input.icon ?? null,
        category: input.category ?? 'learning',
        criteria: input.criteria ?? {},
        xp_reward: input.xpReward ?? 0,
        points_reward: input.pointsReward ?? 0,
      }).select('*').maybeSingle();
      if (error) { logger.error('achievementService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapAchievementRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: Partial<CreateAchievementInput>): Promise<{ data: Achievement | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.criteria !== undefined) updateData.criteria = input.criteria;
      if (input.xpReward !== undefined) updateData.xp_reward = input.xpReward;
      if (input.pointsReward !== undefined) updateData.points_reward = input.pointsReward;
      const { data, error } = await supabase.from('achievements').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('achievementService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapAchievementRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async award(adminId: string, studentId: string, achievementId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('student_achievements').insert({
        student_id: studentId,
        achievement_id: achievementId,
        awarded_by: adminId,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};