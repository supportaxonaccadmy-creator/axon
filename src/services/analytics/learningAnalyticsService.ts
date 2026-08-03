import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { mapLearningAnalytics } from './analyticsHelpers';
import type { StudentLearningAnalytics } from './analytics.types';

const TABLE = 'student_learning_analytics';

export const learningAnalyticsService = {
  async getByStudent(studentId: string): Promise<{ data: StudentLearningAnalytics | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('student_id', studentId).maybeSingle();
    if (error) { logger.error('learningAnalyticsService.getByStudent', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapLearningAnalytics(data as never) : null, error: null };
  },
  async getByBatch(batchId: string): Promise<{ data: StudentLearningAnalytics[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('batch_id', batchId);
    if (error) { logger.error('learningAnalyticsService.getByBatch', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as never[]).map(mapLearningAnalytics), error: null };
  },
  async getAll(): Promise<{ data: StudentLearningAnalytics[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').order('learning_score', { ascending: false });
    if (error) { logger.error('learningAnalyticsService.getAll', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as never[]).map(mapLearningAnalytics), error: null };
  },
  async upsert(input: {
    studentId: string; batchId?: string | null; totalStudyMinutes?: number; weeklyStudyMinutes?: number;
    monthlyStudyMinutes?: number; completionPercentage?: number; attendancePercentage?: number; mcqAccuracy?: number;
    videoCompletionPercentage?: number; pdfReadingPercentage?: number; revisionFrequency?: number; engagementScore?: number;
    learningScore?: number; consistencyScore?: number; streakDays?: number; xpTotal?: number; levelNumber?: number; lastActivityAt?: string;
  }): Promise<{ data: StudentLearningAnalytics | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const row: Record<string, unknown> = { student_id: input.studentId };
    if (input.batchId !== undefined) row.batch_id = input.batchId;
    if (input.totalStudyMinutes !== undefined) row.total_study_minutes = input.totalStudyMinutes;
    if (input.weeklyStudyMinutes !== undefined) row.weekly_study_minutes = input.weeklyStudyMinutes;
    if (input.monthlyStudyMinutes !== undefined) row.monthly_study_minutes = input.monthlyStudyMinutes;
    if (input.completionPercentage !== undefined) row.completion_percentage = input.completionPercentage;
    if (input.attendancePercentage !== undefined) row.attendance_percentage = input.attendancePercentage;
    if (input.mcqAccuracy !== undefined) row.mcq_accuracy = input.mcqAccuracy;
    if (input.videoCompletionPercentage !== undefined) row.video_completion_percentage = input.videoCompletionPercentage;
    if (input.pdfReadingPercentage !== undefined) row.pdf_reading_percentage = input.pdfReadingPercentage;
    if (input.revisionFrequency !== undefined) row.revision_frequency = input.revisionFrequency;
    if (input.engagementScore !== undefined) row.engagement_score = input.engagementScore;
    if (input.learningScore !== undefined) row.learning_score = input.learningScore;
    if (input.consistencyScore !== undefined) row.consistency_score = input.consistencyScore;
    if (input.streakDays !== undefined) row.streak_days = input.streakDays;
    if (input.xpTotal !== undefined) row.xp_total = input.xpTotal;
    if (input.levelNumber !== undefined) row.level_number = input.levelNumber;
    if (input.lastActivityAt !== undefined) row.last_activity_at = input.lastActivityAt;
    const { data, error } = await supabase.from(TABLE).upsert(row, { onConflict: 'student_id,batch_id' }).select('*').maybeSingle();
    if (error) { logger.error('learningAnalyticsService.upsert', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapLearningAnalytics(data as never) : null, error: null };
  },
};
