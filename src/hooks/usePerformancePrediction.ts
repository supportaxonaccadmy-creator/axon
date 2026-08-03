import { useState, useEffect, useCallback } from 'react';
import { performancePredictionService } from '@/services/analytics';
import type { StudentPrediction } from '@/services/analytics';

export function usePerformancePrediction(studentId: string | undefined) {
  const [predictions, setPredictions] = useState<StudentPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true); setError(null);
    const { data, error: err } = await performancePredictionService.getByStudent(studentId);
    setPredictions(data); setError(err); setLoading(false);
  }, [studentId]);
  useEffect(() => { load(); }, [load]);
  return { predictions, loading, error, refresh: load };
}
