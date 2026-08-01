import { getSupabaseClient } from '@/lib/supabase';
import type { StudyStreak } from './gamification.types';
import { mapStudyStreakRow } from './gamificationHelpers';

export const streakService = {
  async getByStudent(studentId: string): Promise<{ data: StudyStreak | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('study_streaks')
        .select('*').eq('student_id', studentId).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapStudyStreakRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async recordStudy(studentId: string): Promise<{ data: StudyStreak | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const parts = new Date().toISOString().split('T');
      const today = parts[0] ?? '';
      const { data: existing } = await supabase.from('study_streaks')
        .select('*').eq('student_id', studentId).maybeSingle();

      if (existing) {
        const row = existing as Record<string, unknown>;
        const lastStudy: string | null = (row.last_study_date as string | null) ?? null;
        let currentStreak = Number(row.current_streak ?? 0);

        if (lastStudy !== null && lastStudy !== undefined) {
          const lastDate = new Date(String(lastStudy));
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) currentStreak += 1;
          else if (diffDays > 1) currentStreak = 1;
        } else {
          currentStreak = 1;
        }

        const longestStreak = Math.max(Number(row.longest_streak ?? 0), currentStreak);
        const { data, error } = await supabase.from('study_streaks')
          .update({ current_streak: currentStreak, longest_streak: longestStreak, last_study_date: today })
          .eq('student_id', studentId).select('*').maybeSingle();
        if (error) return { data: null, error: error.message };
        return { data: data ? mapStudyStreakRow(data as Record<string, unknown>) : null, error: null };
      } else {
        const { data, error } = await supabase.from('study_streaks').insert({
          student_id: studentId,
          current_streak: 1,
          longest_streak: 1,
          last_study_date: today,
        }).select('*').maybeSingle();
        if (error) return { data: null, error: error.message };
        return { data: data ? mapStudyStreakRow(data as Record<string, unknown>) : null, error: null };
      }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async useFreezeDay(studentId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: existing } = await supabase.from('study_streaks')
        .select('*').eq('student_id', studentId).maybeSingle();
      if (!existing) return { error: 'Streak not found' };
      const row = existing as Record<string, unknown>;
      const freezeDays = Number(row.freeze_days ?? 0);
      if (freezeDays <= 0) return { error: 'No freeze days available' };
      const { error } = await supabase.from('study_streaks')
        .update({ freeze_days: freezeDays - 1 }).eq('student_id', studentId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};