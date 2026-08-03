import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { mapLearningAnalytics, mapRetention } from './analyticsHelpers';
import type { BatchAnalyticsSummary } from './analytics.types';

export const batchAnalyticsService = {
  async getBatchSummary(batchId: string): Promise<{ data: BatchAnalyticsSummary | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const [{ data: enrollments }, { data: analytics }, { data: retention }] = await Promise.all([
        supabase.from('enrollments').select('profile_id, status').eq('batch_id', batchId),
        supabase.from('student_learning_analytics').select('*').eq('batch_id', batchId),
        supabase.from('retention_metrics').select('*').eq('batch_id', batchId),
      ]);

      const totalStudents = enrollments?.length ?? 0;
      const analyticsRows = (analytics ?? []).map(mapLearningAnalytics);
      const retentionRows = (retention ?? []).map(mapRetention);
      const activeStudents = retentionRows.filter((r) => r.retentionStatus === 'active').length;
      const atRiskCount = retentionRows.filter((r) => r.retentionStatus === 'at_risk' || r.retentionStatus === 'dormant').length;
      const churnedCount = retentionRows.filter((r) => r.retentionStatus === 'churned').length;

      const avg = (vals: number[]) => (vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);

      return {
        data: {
          batchId,
          totalStudents,
          activeStudents,
          averageEngagement: avg(analyticsRows.map((a) => a.engagementScore)),
          averageCompletion: avg(analyticsRows.map((a) => a.completionPercentage)),
          averageScore: avg(analyticsRows.map((a) => a.learningScore)),
          averageAttendance: avg(analyticsRows.map((a) => a.attendancePercentage)),
          retentionRate: totalStudents > 0 ? ((activeStudents / totalStudents) * 100) : 0,
          churnRate: totalStudents > 0 ? ((churnedCount / totalStudents) * 100) : 0,
          atRiskCount,
        },
        error: null,
      };
    } catch (err) {
      logger.error('batchAnalyticsService.getBatchSummary', { error: err instanceof Error ? err.message : 'Unknown' });
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAllBatchSummaries(): Promise<{ data: BatchAnalyticsSummary[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data: batches, error } = await supabase.from('batches').select('id');
    if (error) {
      logger.error('batchAnalyticsService.getAllBatchSummaries', { error: error.message });
      return { data: [], error: error.message };
    }
    const summaries: BatchAnalyticsSummary[] = [];
    for (const batch of batches ?? []) {
      const result = await this.getBatchSummary(batch.id);
      if (result.data) summaries.push(result.data);
    }
    return { data: summaries, error: null };
  },
};
