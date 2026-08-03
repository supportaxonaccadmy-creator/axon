import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { mapLearningAnalytics, mapPrediction, mapRetention } from './analyticsHelpers';
import type { StudentIntelligence, StudentPrediction } from './analytics.types';

export const studentAnalyticsService = {
  async getStudentIntelligence(studentId: string): Promise<{ data: StudentIntelligence | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const [{ data: profile }, { data: analyticsRow }, { data: predictions }, { data: retentionRow }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').eq('id', studentId).maybeSingle(),
        supabase.from('student_learning_analytics').select('*').eq('student_id', studentId).maybeSingle(),
        supabase.from('student_predictions').select('*').eq('student_id', studentId),
        supabase.from('retention_metrics').select('*').eq('student_id', studentId).maybeSingle(),
      ]);
      if (!profile) return { data: null, error: 'Student not found' };
      const analytics = analyticsRow ? mapLearningAnalytics(analyticsRow as never) : null;
      const preds = (predictions ?? []).map(mapPrediction);
      const retention = retentionRow ? mapRetention(retentionRow as never) : null;
      const getPred = (type: StudentPrediction['predictionType']) => preds.find((p) => p.predictionType === type);
      return {
        data: { studentId: profile.id, fullName: profile.full_name ?? '', email: profile.email ?? '',
          learningScore: analytics?.learningScore ?? 0, engagementScore: analytics?.engagementScore ?? 0,
          consistencyScore: analytics?.consistencyScore ?? 0, completionPercentage: analytics?.completionPercentage ?? 0,
          mcqAccuracy: analytics?.mcqAccuracy ?? 0, attendancePercentage: analytics?.attendancePercentage ?? 0,
          retentionStatus: retention?.retentionStatus ?? 'active', churnRiskLevel: retention?.churnRiskLevel ?? 'low',
          predictedScore: getPred('expected_score')?.predictedValue ?? 0, predictedRank: Math.round(getPred('expected_rank')?.predictedValue ?? 0),
          dropRisk: getPred('drop_risk')?.predictedValue ?? 0, strongSubjects: [], weakSubjects: [], recommendations: [] },
        error: null,
      };
    } catch (err) {
      logger.error('studentAnalyticsService.getStudentIntelligence', { error: err instanceof Error ? err.message : 'Unknown' });
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
  async getAllIntelligence(): Promise<{ data: StudentIntelligence[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data: students, error } = await supabase.from('profiles').select('id').eq('role', 'student');
    if (error) { logger.error('studentAnalyticsService.getAllIntelligence', { error: error.message }); return { data: [], error: error.message }; }
    const results: StudentIntelligence[] = [];
    for (const student of students ?? []) { const result = await this.getStudentIntelligence(student.id); if (result.data) results.push(result.data); }
    return { data: results, error: null };
  },
};
