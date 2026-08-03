import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { mapRetention, calculateRetentionStatus, calculateDropRisk } from './analyticsHelpers';
import type { RetentionMetric } from './analytics.types';

const TABLE = 'retention_metrics';

export const retentionService = {
  async getByStudent(studentId: string): Promise<{ data: RetentionMetric | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('student_id', studentId).maybeSingle();
    if (error) { logger.error('retentionService.getByStudent', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapRetention(data as never) : null, error: null };
  },
  async getAll(): Promise<{ data: RetentionMetric[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) { logger.error('retentionService.getAll', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as never[]).map(mapRetention), error: null };
  },
  async getByBatch(batchId: string): Promise<{ data: RetentionMetric[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('batch_id', batchId);
    if (error) { logger.error('retentionService.getByBatch', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as never[]).map(mapRetention), error: null };
  },
  async upsert(input: {
    studentId: string; batchId?: string | null; enrollmentDate: string; lastActivityDate?: string | null;
    daysActive?: number; daysSinceLastActivity?: number; engagementScore?: number; consistencyScore?: number; completionPercentage?: number;
  }): Promise<{ data: RetentionMetric | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const daysSince = input.daysSinceLastActivity ?? 0;
    const { status, riskLevel } = calculateRetentionStatus(daysSince);
    const churnProbability = calculateDropRisk({ daysSinceLastActivity: daysSince, completionPercentage: input.completionPercentage ?? 0, engagementScore: input.engagementScore ?? 0, consistencyScore: input.consistencyScore ?? 0 });
    const row: Record<string, unknown> = {
      student_id: input.studentId, batch_id: input.batchId ?? null, enrollment_date: input.enrollmentDate,
      last_activity_date: input.lastActivityDate ?? null, days_active: input.daysActive ?? 0, days_since_last_activity: daysSince,
      retention_status: status, churn_risk_level: riskLevel, churn_probability: churnProbability, re_engagement_score: Math.max(100 - churnProbability, 0),
    };
    const { data, error } = await supabase.from(TABLE).upsert(row, { onConflict: 'student_id,batch_id' }).select('*').maybeSingle();
    if (error) { logger.error('retentionService.upsert', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapRetention(data as never) : null, error: null };
  },
};
