import { useState, useEffect, useCallback } from 'react';
import { goalTrackingService } from '@/services/ai';
import type { StudyGoal, CreateStudyGoalInput } from '@/services/ai';

export function useDailyGoals(studentId: string | null) {
  const [dailyGoal, setDailyGoal] = useState<StudyGoal | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<StudyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const [dailyRes, weeklyRes] = await Promise.all([
      goalTrackingService.getDailyGoal(studentId),
      goalTrackingService.getWeeklyGoal(studentId),
    ]);
    if (dailyRes.error) setError(dailyRes.error);
    else { setDailyGoal(dailyRes.data); setError(null); }
    setWeeklyGoal(weeklyRes.data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchGoals(); }, [fetchGoals]);

  const createGoal = useCallback(async (input: CreateStudyGoalInput) => {
    if (!studentId) return { data: null, error: 'No student' };
    const { data, error: err } = await goalTrackingService.createGoal(studentId, input);
    if (!err) void fetchGoals();
    return { data, error: err };
  }, [studentId, fetchGoals]);

  const updateProgress = useCallback(async (id: string, updates: Partial<Pick<StudyGoal, 'achievedMinutes' | 'achievedChapters' | 'achievedMcqs' | 'achievedVideos'>>) => {
    const { error: err } = await goalTrackingService.updateProgress(id, updates);
    if (!err) void fetchGoals();
    return { error: err };
  }, [fetchGoals]);

  return { dailyGoal, weeklyGoal, loading, error, createGoal, updateProgress, refetch: fetchGoals };
}
