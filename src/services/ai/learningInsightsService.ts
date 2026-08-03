import { getSupabaseClient } from '@/lib/supabase';
import type { LearningInsight, CreateInsightInput } from './ai.types';
import { mapInsightRow } from './aiHelpers';

export const learningInsightsService = {
  async getByStudent(studentId: string, limit: number = 20): Promise<{ data: LearningInsight[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('learning_insights').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapInsightRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getUnread(studentId: string): Promise<{ data: LearningInsight[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('learning_insights').select('*').eq('student_id', studentId).eq('is_read', false).order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapInsightRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(studentId: string, input: CreateInsightInput): Promise<{ data: LearningInsight | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('learning_insights').insert({
        student_id: studentId,
        type: input.type,
        severity: input.severity ?? 'info',
        title: input.title,
        description: input.description ?? null,
        actionable_advice: input.actionableAdvice ?? null,
        metadata: input.metadata ?? {},
      }).select('*').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapInsightRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markRead(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('learning_insights').update({ is_read: true }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markAllRead(studentId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('learning_insights').update({ is_read: true }).eq('student_id', studentId).eq('is_read', false);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('learning_insights').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
