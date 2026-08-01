import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { RewardPoint, AwardPointsInput } from './gamification.types';
import { mapRewardPointRow } from './gamificationHelpers';

export const rewardService = {
  async getByStudent(studentId: string, limit: number = 50): Promise<{ data: RewardPoint[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('reward_points')
        .select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRewardPointRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getBalance(studentId: string): Promise<{ data: number; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('reward_points')
        .select('balance').eq('student_id', studentId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error) return { data: 0, error: error.message };
      return { data: data ? Number((data as Record<string, unknown>).balance ?? 0) : 0, error: null };
    } catch (err) {
      return { data: 0, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async award(input: AwardPointsInput): Promise<{ data: RewardPoint | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: balanceData } = await supabase.from('reward_points')
        .select('balance').eq('student_id', input.studentId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      const currentBalance = balanceData ? Number((balanceData as Record<string, unknown>).balance ?? 0) : 0;
      const newBalance = input.type === 'redeemed' ? currentBalance - Math.abs(input.amount) : currentBalance + input.amount;

      const { data, error } = await supabase.from('reward_points').insert({
        student_id: input.studentId,
        type: input.type ?? 'awarded',
        points: input.amount,
        balance: newBalance,
        description: input.description ?? null,
        reference_id: input.referenceId ?? null,
      }).select('*').maybeSingle();
      if (error) { logger.error('rewardService.award', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapRewardPointRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(limit: number = 50, offset: number = 0): Promise<{ data: RewardPoint[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('reward_points')
        .select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapRewardPointRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStudentAdmin(studentId: string, limit: number = 50): Promise<{ data: RewardPoint[]; error: string | null }> {
    return this.getByStudent(studentId, limit);
  },
};