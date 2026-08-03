import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { mapPrediction } from './analyticsHelpers';
import type { StudentPrediction, PredictionType } from './analytics.types';

const TABLE = 'student_predictions';

export const performancePredictionService = {
  async getByStudent(studentId: string): Promise<{ data: StudentPrediction[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('student_id', studentId);
    if (error) { logger.error('performancePredictionService.getByStudent', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as never[]).map(mapPrediction), error: null };
  },
  async getByType(studentId: string, type: PredictionType): Promise<{ data: StudentPrediction | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('student_id', studentId).eq('prediction_type', type).maybeSingle();
    if (error) { logger.error('performancePredictionService.getByType', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPrediction(data as never) : null, error: null };
  },
  async getAll(): Promise<{ data: StudentPrediction[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) { logger.error('performancePredictionService.getAll', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as never[]).map(mapPrediction), error: null };
  },
  async upsert(input: {
    studentId: string; predictionType: PredictionType; predictedValue: number; confidence: number;
    trend?: StudentPrediction['trend']; factors?: Record<string, unknown>; notes?: string;
  }): Promise<{ data: StudentPrediction | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const row: Record<string, unknown> = {
      student_id: input.studentId, prediction_type: input.predictionType, predicted_value: input.predictedValue,
      confidence: input.confidence, trend: input.trend ?? 'stable', factors: input.factors ?? {}, notes: input.notes ?? null,
    };
    const { data, error } = await supabase.from(TABLE).upsert(row, { onConflict: 'student_id,prediction_type' }).select('*').maybeSingle();
    if (error) { logger.error('performancePredictionService.upsert', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPrediction(data as never) : null, error: null };
  },
};
