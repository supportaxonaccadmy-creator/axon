import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LearningRecommendation, CreateRecommendationInput } from './ai.types';
import { mapRecommendationRow } from './aiHelpers';

export const recommendationService = {
  async getByStudent(studentId: string, limit: number = 20): Promise<{ data: LearningRecommendation[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('learning_recommendations').select('*').eq('student_id', studentId).eq('is_dismissed', false).order('priority', { ascending: false }).order('created_at', { ascending: false }).limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRecommendationRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByType(studentId: string, type: string): Promise<{ data: LearningRecommendation[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('learning_recommendations').select('*').eq('student_id', studentId).eq('type', type).eq('is_dismissed', false).order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRecommendationRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(studentId: string, input: CreateRecommendationInput): Promise<{ data: LearningRecommendation | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('learning_recommendations').insert({
        student_id: studentId,
        type: input.type,
        priority: input.priority ?? 'medium',
        title: input.title,
        description: input.description ?? null,
        reason: input.reason ?? null,
        reference_id: input.referenceId ?? null,
        reference_type: input.referenceType ?? null,
        metadata: input.metadata ?? {},
        score: input.score ?? 0,
        expires_at: input.expiresAt ?? null,
      }).select('*').maybeSingle();
      if (error) { logger.error('recommendationService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapRecommendationRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async dismiss(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('learning_recommendations').update({ is_dismissed: true }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async markCompleted(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('learning_recommendations').update({ is_completed: true }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('learning_recommendations').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
