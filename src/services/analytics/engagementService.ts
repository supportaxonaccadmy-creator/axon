import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { mapEngagement, calculateEngagementScore } from './analyticsHelpers';
import type { EngagementMetric } from './analytics.types';

const TABLE = 'engagement_metrics';

export const engagementService = {
  async getByStudent(studentId: string, days = 30): Promise<{ data: EngagementMetric[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const startDate = new Date(); startDate.setDate(startDate.getDate() - days);
    const { data, error } = await supabase.from(TABLE).select('*').eq('student_id', studentId).gte('metric_date', startDate.toISOString().split('T')[0] ?? '').order('metric_date', { ascending: true });
    if (error) { logger.error('engagementService.getByStudent', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as never[]).map(mapEngagement), error: null };
  },
  async getByBatch(batchId: string): Promise<{ data: EngagementMetric[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data: enrollments } = await supabase.from('enrollments').select('profile_id').eq('batch_id', batchId);
    if (!enrollments || enrollments.length === 0) return { data: [], error: null };
    const studentIds = enrollments.map((e) => e.profile_id);
    const { data, error } = await supabase.from(TABLE).select('*').in('student_id', studentIds).order('metric_date', { ascending: true });
    if (error) { logger.error('engagementService.getByBatch', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as never[]).map(mapEngagement), error: null };
  },
  async record(input: {
    studentId: string; metricDate?: string; sessionCount?: number; totalDurationMinutes?: number;
    videosWatched?: number; pdfsRead?: number; mcqsAttempted?: number; liveClassesAttended?: number; interactions?: number;
  }): Promise<{ data: EngagementMetric | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const score = calculateEngagementScore({
      sessionCount: input.sessionCount ?? 0, totalDurationMinutes: input.totalDurationMinutes ?? 0,
      videosWatched: input.videosWatched ?? 0, pdfsRead: input.pdfsRead ?? 0, mcqsAttempted: input.mcqsAttempted ?? 0,
      liveClassesAttended: input.liveClassesAttended ?? 0, interactions: input.interactions ?? 0,
    });
    const row: Record<string, unknown> = {
      student_id: input.studentId, metric_date: input.metricDate ?? new Date().toISOString().split('T')[0],
      session_count: input.sessionCount ?? 0, total_duration_minutes: input.totalDurationMinutes ?? 0,
      videos_watched: input.videosWatched ?? 0, pdfs_read: input.pdfsRead ?? 0, mcqs_attempted: input.mcqsAttempted ?? 0,
      live_classes_attended: input.liveClassesAttended ?? 0, interactions: input.interactions ?? 0, engagement_score: score,
    };
    const { data, error } = await supabase.from(TABLE).upsert(row, { onConflict: 'student_id,metric_date' }).select('*').maybeSingle();
    if (error) { logger.error('engagementService.record', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapEngagement(data as never) : null, error: null };
  },
};
