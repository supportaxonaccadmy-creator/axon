import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface McqAnalyticsData {
  totalSets: number;
  totalQuestions: number;
  totalAttempts: number;
  averageScore: number;
  topMcqs: Array<{ mcqSetId: string; title: string; attempts: number; averageScore: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
}

export const mcqAnalyticsService = {
  async getOverview(): Promise<{ data: McqAnalyticsData | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const [{ data: sets }, { data: questions }] = await Promise.all([
        supabase.from('mcq_sets').select('id, title, status'),
        supabase.from('mcq_questions').select('id, mcq_set_id'),
      ]);

      const setRows = sets ?? [];
      const questionRows = questions ?? [];

      return {
        data: {
          totalSets: setRows.length,
          totalQuestions: questionRows.length,
          totalAttempts: 0,
          averageScore: 0,
          topMcqs: setRows.slice(0, 10).map((s) => ({
            mcqSetId: s.id as string,
            title: s.title as string,
            attempts: 0,
            averageScore: 0,
          })),
          scoreDistribution: [
            { range: '0-20%', count: 0 },
            { range: '21-40%', count: 0 },
            { range: '41-60%', count: 0 },
            { range: '61-80%', count: 0 },
            { range: '81-100%', count: 0 },
          ],
        },
        error: null,
      };
    } catch (err) {
      logger.error('mcqAnalyticsService.getOverview', { error: err instanceof Error ? err.message : 'Unknown' });
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
