import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { StudentXp, AwardXpInput } from './gamification.types';
import { mapStudentXpRow, calculateLevel } from './gamificationHelpers';

export const xpService = {
  async getByStudent(studentId: string): Promise<{ data: StudentXp | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('student_xp')
        .select('*').eq('student_id', studentId).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapStudentXpRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async award(input: AwardXpInput): Promise<{ data: StudentXp | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: existing } = await supabase.from('student_xp')
        .select('*').eq('student_id', input.studentId).maybeSingle();

      if (existing) {
        const row = existing as Record<string, unknown>;
        const newXp = Number(row.total_xp ?? 0) + input.amount;
        const { data, error } = await supabase.from('student_xp')
          .update({ total_xp: newXp }).eq('student_id', input.studentId).select('*').maybeSingle();
        if (error) { logger.error('xpService.award update', { error: error.message }); return { data: null, error: error.message }; }

        const level = calculateLevel(newXp);
        await supabase.from('student_levels').upsert({
          student_id: input.studentId,
          current_level: level.level,
          xp_for_current_level: level.xpForCurrent,
          xp_for_next_level: level.xpForNext,
        }, { onConflict: 'student_id' });

        return { data: data ? mapStudentXpRow(data as Record<string, unknown>) : null, error: null };
      } else {
        const { data, error } = await supabase.from('student_xp').insert({
          student_id: input.studentId,
          total_xp: input.amount,
        }).select('*').maybeSingle();
        if (error) { logger.error('xpService.award insert', { error: error.message }); return { data: null, error: error.message }; }

        const level = calculateLevel(input.amount);
        await supabase.from('student_levels').insert({
          student_id: input.studentId,
          current_level: level.level,
          xp_for_current_level: level.xpForCurrent,
          xp_for_next_level: level.xpForNext,
        });

        return { data: data ? mapStudentXpRow(data as Record<string, unknown>) : null, error: null };
      }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(limit: number = 50): Promise<{ data: StudentXp[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('student_xp')
        .select('*').order('total_xp', { ascending: false }).limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapStudentXpRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};