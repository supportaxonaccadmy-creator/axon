import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Mission, StudentMission, CreateMissionInput } from './gamification.types';
import { mapMissionRow, mapStudentMissionRow } from './gamificationHelpers';

export const missionService = {
  async getAll(): Promise<{ data: Mission[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('missions')
        .select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapMissionRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAllAdmin(): Promise<{ data: Mission[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('missions')
        .select('*').order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapMissionRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStudent(studentId: string): Promise<{ data: StudentMission[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('student_missions')
        .select('*, missions!student_missions_mission_id_fkey(*)')
        .eq('student_id', studentId).order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapStudentMissionRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async create(_adminId: string, input: CreateMissionInput): Promise<{ data: Mission | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('missions').insert({
        name: input.name,
        description: input.description ?? null,
        type: input.type ?? 'daily',
        action: input.action ?? 'custom',
        target_count: input.targetCount ?? 1,
        xp_reward: input.xpReward ?? 0,
        points_reward: input.pointsReward ?? 0,
        start_date: input.startDate ?? null,
        end_date: input.endDate ?? null,
      }).select('*').maybeSingle();
      if (error) { logger.error('missionService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapMissionRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async update(id: string, input: Partial<CreateMissionInput>): Promise<{ data: Mission | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.action !== undefined) updateData.action = input.action;
      if (input.targetCount !== undefined) updateData.target_count = input.targetCount;
      if (input.xpReward !== undefined) updateData.xp_reward = input.xpReward;
      if (input.pointsReward !== undefined) updateData.points_reward = input.pointsReward;
      if (input.startDate !== undefined) updateData.start_date = input.startDate;
      if (input.endDate !== undefined) updateData.end_date = input.endDate;
      const { data, error } = await supabase.from('missions').update(updateData).eq('id', id).select('*').maybeSingle();
      if (error) { logger.error('missionService.update', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapMissionRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('missions').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async updateProgress(studentId: string, missionId: string, progress: number): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const isCompleted = progress >= 1;
      const { error } = await supabase.from('student_missions').upsert({
        student_id: studentId,
        mission_id: missionId,
        progress: progress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }, { onConflict: 'student_id,mission_id' });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async claimReward(studentId: string, missionId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('student_missions')
        .update({ is_reward_claimed: true, claimed_at: new Date().toISOString() })
        .eq('student_id', studentId).eq('mission_id', missionId).eq('is_completed', true).eq('is_reward_claimed', false);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};