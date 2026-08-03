import { getSupabaseClient } from '@/lib/supabase';
import type { StudyGoal, CreateStudyGoalInput, DailyTarget, CreateDailyTargetInput } from './ai.types';
import { mapGoalRow, mapDailyTargetRow } from './aiHelpers';

export const studyPlannerService = {
  async getGoals(studentId: string): Promise<{ data: StudyGoal[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('study_goals').select('*').eq('student_id', studentId).eq('is_active', true).order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapGoalRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async createGoal(studentId: string, input: CreateStudyGoalInput): Promise<{ data: StudyGoal | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
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

  async updateGoal(id: string, input: Partial<CreateStudyGoalInput>): Promise<{ data: StudyGoal | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.targetMinutes !== undefined) updateData.target_minutes = input.targetMinutes;
      if (input.targetChapters !== undefined) updateData.target_chapters = input.targetChapters;
      if (input.targetMcqs !== undefined) updateData.target_mcqs = input.targetMcqs;
      if (input.targetVideos !== undefined) updateData.target_videos = input.targetVideos;
      if (input.endDate !== undefined) updateData.end_date = input.endDate;
      const { data, error } = await supabase.from('study_goals').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapGoalRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async updateProgress(id: string, field: 'achievedMinutes' | 'achievedChapters' | 'achievedMcqs' | 'achievedVideos', value: number): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const fieldMap: Record<string, string> = { achievedMinutes: 'achieved_minutes', achievedChapters: 'achieved_chapters', achievedMcqs: 'achieved_mcqs', achievedVideos: 'achieved_videos' };
      const dbField = fieldMap[field] ?? field;
      const { error } = await supabase.from('study_goals').update({ [dbField]: value }).eq('id', id);
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

  async getDailyTargets(studentId: string, date?: string): Promise<{ data: DailyTarget[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const targetDate = date ?? new Date().toISOString().split('T')[0] ?? '';
      const { data, error } = await supabase.from('daily_targets').select('*').eq('student_id', studentId).eq('target_date', targetDate).order('created_at', { ascending: true });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapDailyTargetRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async createDailyTarget(studentId: string, input: CreateDailyTargetInput): Promise<{ data: DailyTarget | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('daily_targets').insert({
        student_id: studentId,
        target_date: input.targetDate ?? new Date().toISOString().split('T')[0],
        target_type: input.targetType,
        target_count: input.targetCount,
        reference_id: input.referenceId ?? null,
        metadata: input.metadata ?? {},
      }).select('*').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapDailyTargetRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async updateTargetProgress(id: string, completedCount: number): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const isCompleted = completedCount > 0;
      const { error } = await supabase.from('daily_targets').update({
        completed_count: completedCount,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async deleteTarget(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('daily_targets').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
