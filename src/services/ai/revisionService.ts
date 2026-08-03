import { getSupabaseClient } from '@/lib/supabase';
import type { RevisionItem, CreateRevisionInput } from './ai.types';
import { mapRevisionRow, calculateSpacedRepetitionInterval } from './aiHelpers';

export const revisionService = {
  async getByStudent(studentId: string): Promise<{ data: RevisionItem[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('revision_schedule').select('*').eq('student_id', studentId).eq('is_completed', false).order('next_revision_date', { ascending: true });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRevisionRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getDueToday(studentId: string): Promise<{ data: RevisionItem[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const today = new Date().toISOString().split('T')[0] ?? '';
      const { data, error } = await supabase.from('revision_schedule').select('*').eq('student_id', studentId).eq('is_completed', false).lte('next_revision_date', today).order('next_revision_date', { ascending: true });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRevisionRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(studentId: string, input: CreateRevisionInput): Promise<{ data: RevisionItem | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('revision_schedule').insert({
        student_id: studentId,
        subject_id: input.subjectId ?? null,
        chapter_id: input.chapterId ?? null,
        batch_id: input.batchId ?? null,
        topic_name: input.topicName,
        next_revision_date: input.nextRevisionDate ?? new Date().toISOString().split('T')[0],
        interval_days: input.intervalDays ?? 1,
        confidence_score: input.confidenceScore ?? 0.5,
      }).select('*').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapRevisionRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markRevised(id: string, confidenceScore: number): Promise<{ data: RevisionItem | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: existing } = await supabase.from('revision_schedule').select('*').eq('id', id).maybeSingle();
      if (!existing) return { data: null, error: 'Revision item not found' };
      const row = existing as Record<string, unknown>;
      const revisionCount = Number(row.revision_count ?? 0) + 1;
      const intervalDays = calculateSpacedRepetitionInterval(revisionCount, confidenceScore);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + intervalDays);
      const { data, error } = await supabase.from('revision_schedule').update({
        revision_count: revisionCount,
        last_revised_at: new Date().toISOString(),
        next_revision_date: nextDate.toISOString().split('T')[0],
        interval_days: intervalDays,
        confidence_score: confidenceScore,
      }).eq('id', id).select('*').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapRevisionRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async complete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('revision_schedule').update({ is_completed: true }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('revision_schedule').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
