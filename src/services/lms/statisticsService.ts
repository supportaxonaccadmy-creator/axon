import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface BatchStatistics {
  subjectCount: number;
  chapterCount: number;
  classCount: number;
  videoCount: number;
  pdfCount: number;
  mcqCount: number;
  enrollmentCount: number;
  revenue: number;
}

export interface GlobalStatistics {
  batchCount: number;
  subjectCount: number;
  chapterCount: number;
  classCount: number;
  videoCount: number;
  pdfCount: number;
  mcqSetCount: number;
  mcqQuestionCount: number;
  attachmentCount: number;
  enrollmentCount: number;
  purchaseCount: number;
  totalRevenue: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
}

export interface ContentStatusCounts {
  published: number;
  draft: number;
  archived: number;
}

export const statisticsService = {
  async getBatchStatistics(batchId: string): Promise<{ data: BatchStatistics | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const [subjects, chapters, classes, videos, pdfs, mcqSets, enrollments, purchases] = await Promise.all([
        supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('batch_id', batchId),
        supabase.from('chapters').select('id', { count: 'exact', head: true }).in('subject_id', (await supabase.from('subjects').select('id').eq('batch_id', batchId)).data?.map((s: { id: string }) => s.id) ?? []),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('pdf_notes').select('id', { count: 'exact', head: true }),
        supabase.from('mcq_sets').select('id', { count: 'exact', head: true }).eq('class_id', ''),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('batch_id', batchId),
        supabase.from('purchases').select('amount').eq('batch_id', batchId).eq('payment_status', 'completed'),
      ]);

      const revenue = (purchases.data ?? []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);

      return {
        data: {
          subjectCount: subjects.count ?? 0,
          chapterCount: chapters.count ?? 0,
          classCount: classes.count ?? 0,
          videoCount: videos.count ?? 0,
          pdfCount: pdfs.count ?? 0,
          mcqCount: mcqSets.count ?? 0,
          enrollmentCount: enrollments.count ?? 0,
          revenue,
        },
        error: null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('statisticsService.getBatchStatistics', { error: msg });
      return { data: null, error: msg };
    }
  },

  async getGlobalStatistics(): Promise<{ data: GlobalStatistics | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const tables = ['batches', 'subjects', 'chapters', 'classes', 'videos', 'pdf_notes', 'mcq_sets', 'mcq_questions', 'attachments', 'enrollments', 'purchases'];
      const counts = await Promise.all(
        tables.map((t) => supabase.from(t).select('id', { count: 'exact', head: true })),
      );

      const countMap: Record<string, number> = {};
      tables.forEach((t, i) => { countMap[t] = counts[i]?.count ?? 0; });

      const publishedCounts = await Promise.all(
        tables.slice(0, 9).map((t) => supabase.from(t).select('id', { count: 'exact', head: true }).eq('status', 'published')),
      );
      const draftCounts = await Promise.all(
        tables.slice(0, 9).map((t) => supabase.from(t).select('id', { count: 'exact', head: true }).eq('status', 'draft')),
      );

      const publishedCount = publishedCounts.reduce((sum, r) => sum + (r.count ?? 0), 0);
      const draftCount = draftCounts.reduce((sum, r) => sum + (r.count ?? 0), 0);

      const { data: revenueData } = await supabase.from('purchases').select('amount').eq('payment_status', 'completed');
      const totalRevenue = (revenueData ?? []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);

      return {
        data: {
          batchCount: countMap['batches'] ?? 0,
          subjectCount: countMap['subjects'] ?? 0,
          chapterCount: countMap['chapters'] ?? 0,
          classCount: countMap['classes'] ?? 0,
          videoCount: countMap['videos'] ?? 0,
          pdfCount: countMap['pdf_notes'] ?? 0,
          mcqSetCount: countMap['mcq_sets'] ?? 0,
          mcqQuestionCount: countMap['mcq_questions'] ?? 0,
          attachmentCount: countMap['attachments'] ?? 0,
          enrollmentCount: countMap['enrollments'] ?? 0,
          purchaseCount: countMap['purchases'] ?? 0,
          totalRevenue,
          publishedCount,
          draftCount,
          archivedCount: 0,
        },
        error: null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('statisticsService.getGlobalStatistics', { error: msg });
      return { data: null, error: msg };
    }
  },

  async getContentStatusCounts(table: string): Promise<{ data: ContentStatusCounts | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const [published, draft, archived] = await Promise.all([
        supabase.from(table).select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from(table).select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from(table).select('id', { count: 'exact', head: true }).eq('status', 'archived'),
      ]);
      return {
        data: { published: published.count ?? 0, draft: draft.count ?? 0, archived: archived.count ?? 0 },
        error: null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('statisticsService.getContentStatusCounts', { error: msg });
      return { data: null, error: msg };
    }
  },

  async getRevenueSummary(): Promise<{ data: { totalRevenue: number; completedCount: number; pendingCount: number; failedCount: number; refundedCount: number } | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const [completed, pending, failed, refunded] = await Promise.all([
        supabase.from('purchases').select('amount').eq('payment_status', 'completed'),
        supabase.from('purchases').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending'),
        supabase.from('purchases').select('id', { count: 'exact', head: true }).eq('payment_status', 'failed'),
        supabase.from('purchases').select('id', { count: 'exact', head: true }).eq('payment_status', 'refunded'),
      ]);
      const totalRevenue = (completed.data ?? []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);
      return {
        data: { totalRevenue, completedCount: completed.data?.length ?? 0, pendingCount: pending.count ?? 0, failedCount: failed.count ?? 0, refundedCount: refunded.count ?? 0 },
        error: null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('statisticsService.getRevenueSummary', { error: msg });
      return { data: null, error: msg };
    }
  },
};
