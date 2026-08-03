import { useState, useEffect, useCallback } from 'react';
import { learningAnalyticsService } from '@/services/analytics';
import type { StudentLearningAnalytics } from '@/services/analytics';

export function useLearningAnalytics(studentId: string | undefined) {
  const [analytics, setAnalytics] = useState<StudentLearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true); setError(null);
    const { data, error: err } = await learningAnalyticsService.getByStudent(studentId);
    setAnalytics(data); setError(err); setLoading(false);
  }, [studentId]);
  useEffect(() => { load(); }, [load]);
  return { analytics, loading, error, refresh: load };
}
