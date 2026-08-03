import { getSupabaseClient } from '@/lib/supabase';
import type { StudyGoal, CreateStudyGoalInput } from './ai.types';
import { mapGoalRow } from './aiHelpers';

export const goalTrackingService = {
  async getActiveGoals(studentId: string): Promise<{ data: StudyGoal[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('study_goals').select('*').eq('student_id', studentId).eq('is_active', true).order('period', { ascending: true });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapGoalRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getDailyGoal(studentId: string): Promise<{ data: StudyGoal | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('study_goals').select('*').eq('student_id', studentId).eq('period', 'daily').eq('is_active', true).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapGoalRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getWeeklyGoal(studentId: string): Promise<{ data: StudyGoal | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('study_goals').select('*').eq('student_id', studentId).eq('period', 'weekly').eq('is_active', true).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapGoalRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async createGoal(studentId: string, input: CreateStudyGoalInput): Promise<{ data: StudyGoal | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('study_goals').update({ is_active: false }).eq('student_id', studentId).eq('period', input.period ?? 'daily');
      const { data, error } = await supabase.from('study_goals').insert({
        student_id: studentId,
        period: input.period ?? 'daily',
        target_minutes: input.targetMinutes ?? 60,
        target_chapters: input.targetChapters ?? 1,
        target_mcqs: input.targetMcqs ?? 10,
        target_videos: input.targetVideos ?? 2,
        end_date: input.endDate ?? null,
      }).select('*').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapGoalRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async updateProgress(id: string, updates: Partial<Pick<StudyGoal, 'achievedMinutes' | 'achievedChapters' | 'achievedMcqs' | 'achievedVideos'>>): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (updates.achievedMinutes !== undefined) updateData.achieved_minutes = updates.achievedMinutes;
      if (updates.achievedChapters !== undefined) updateData.achieved_chapters = updates.achievedChapters;
      if (updates.achievedMcqs !== undefined) updateData.achieved_mcqs = updates.achievedMcqs;
      if (updates.achievedVideos !== undefined) updateData.achieved_videos = updates.achievedVideos;
      const { error } = await supabase.from('study_goals').update(updateData).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async deleteGoal(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('study_goals').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
