import { useState, useEffect, useCallback } from 'react';
import { learningInsightsService } from '@/services/ai';
import type { LearningInsight } from '@/services/ai';

export function useLearningInsights(studentId: string | null) {
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await learningInsightsService.getByStudent(studentId, 20);
    if (err) setError(err);
    else { setInsights(data); setUnreadCount(data.filter((i) => !i.isRead).length); setError(null); }
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchInsights(); }, [fetchInsights]);

  const markRead = useCallback(async (id: string) => {
    const { error: err } = await learningInsightsService.markRead(id);
    if (!err) void fetchInsights();
    return { error: err };
  }, [fetchInsights]);

  const markAllRead = useCallback(async () => {
    if (!studentId) return;
    const { error: err } = await learningInsightsService.markAllRead(studentId);
    if (!err) void fetchInsights();
    return { error: err };
  }, [studentId, fetchInsights]);

  return { insights, unreadCount, loading, error, markRead, markAllRead, refetch: fetchInsights };
}
