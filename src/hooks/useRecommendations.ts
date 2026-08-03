import { useState, useEffect, useCallback } from 'react';
import { recommendationService } from '@/services/ai';
import type { LearningRecommendation } from '@/services/ai';

export function useRecommendations(studentId: string | null) {
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await recommendationService.getByStudent(studentId, 20);
    if (err) setError(err);
    else { setRecommendations(data); setError(null); }
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchRecommendations(); }, [fetchRecommendations]);

  const dismiss = useCallback(async (id: string) => {
    const { error: err } = await recommendationService.dismiss(id);
    if (!err) void fetchRecommendations();
    return { error: err };
  }, [fetchRecommendations]);

  const markCompleted = useCallback(async (id: string) => {
    const { error: err } = await recommendationService.markCompleted(id);
    if (!err) void fetchRecommendations();
    return { error: err };
  }, [fetchRecommendations]);

  return { recommendations, loading, error, dismiss, markCompleted, refetch: fetchRecommendations };
}
