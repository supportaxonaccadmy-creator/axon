import { getSupabaseClient } from '@/lib/supabase';
import type { LeaderboardEntry, LeaderboardFilter } from './gamification.types';
import { mapLeaderboardRow } from './gamificationHelpers';

export const leaderboardService = {
  async getLeaderboard(filter?: LeaderboardFilter): Promise<{ data: LeaderboardEntry[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('leaderboards')
        .select('*')
        .order('rank', { ascending: true });

      if (filter?.category) query = query.eq('category', filter.category);
      if (filter?.period) query = query.eq('period', filter.period);
      if (filter?.batchId) query = query.eq('batch_id', filter.batchId);

      const limit = filter?.limit ?? 50;
      query = query.limit(limit);

      const { data, error } = await query;
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapLeaderboardRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStudent(studentId: string): Promise<{ data: LeaderboardEntry[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('leaderboards')
        .select('*').eq('student_id', studentId).order('rank', { ascending: true });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapLeaderboardRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStudentRank(studentId: string, category: string, period: string): Promise<{ data: LeaderboardEntry | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('leaderboards')
        .select('*').eq('student_id', studentId).eq('category', category).eq('period', period).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapLeaderboardRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(limit: number = 50): Promise<{ data: LeaderboardEntry[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('leaderboards')
        .select('*').order('rank', { ascending: true }).limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapLeaderboardRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};