import { getSupabaseClient } from '@/lib/supabase';
import type { StudentLevel } from './gamification.types';
import { mapStudentLevelRow, calculateLevel } from './gamificationHelpers';

export const levelService = {
  async getByStudent(studentId: string): Promise<{ data: StudentLevel | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('student_levels')
        .select('*').eq('student_id', studentId).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapStudentLevelRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async recalculate(studentId: string, totalXp: number): Promise<{ data: StudentLevel | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const level = calculateLevel(totalXp);
      const { data, error } = await supabase.from('student_levels').upsert({
        student_id: studentId,
        current_level: level.level,
        xp_for_current_level: level.xpForCurrent,
        xp_for_next_level: level.xpForNext,
      }, { onConflict: 'student_id' }).select('*').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapStudentLevelRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(limit: number = 50): Promise<{ data: StudentLevel[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('student_levels')
        .select('*').order('current_level', { ascending: false }).limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapStudentLevelRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};