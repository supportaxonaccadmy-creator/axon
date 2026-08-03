import { useState, useEffect, useCallback } from 'react';
import { studyPlannerService } from '@/services/ai';
import type { StudyGoal, DailyTarget, CreateStudyGoalInput, CreateDailyTargetInput } from '@/services/ai';

export function useStudyPlanner(studentId: string | null) {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [dailyTargets, setDailyTargets] = useState<DailyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const [goalsRes, targetsRes] = await Promise.all([
      studyPlannerService.getGoals(studentId),
      studyPlannerService.getDailyTargets(studentId),
    ]);
    if (goalsRes.error) setError(goalsRes.error);
    else { setGoals(goalsRes.data); setError(null); }
    setDailyTargets(targetsRes.data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const createGoal = useCallback(async (input: CreateStudyGoalInput) => {
    if (!studentId) return { data: null, error: 'No student' };
    const { data, error: err } = await studyPlannerService.createGoal(studentId, input);
    if (!err) void fetchAll();
    return { data, error: err };
  }, [studentId, fetchAll]);

  const createDailyTarget = useCallback(async (input: CreateDailyTargetInput) => {
    if (!studentId) return { data: null, error: 'No student' };
    const { data, error: err } = await studyPlannerService.createDailyTarget(studentId, input);
    if (!err) void fetchAll();
    return { data, error: err };
  }, [studentId, fetchAll])

  const updateTargetProgress = useCallback(async (id: string, completedCount: number) => {
    const { error: err } = await studyPlannerService.updateTargetProgress(id, completedCount);
    if (!err) void fetchAll();
    return { error: err };
  }, [fetchAll]);

  const deleteTarget = useCallback(async (id: string) => {
    const { error: err } = await studyPlannerService.deleteTarget(id);
    if (!err) void fetchAll();
    return { error: err };
  }, [fetchAll]);

  return { goals, dailyTargets, loading, error, createGoal, createDailyTarget, updateTargetProgress, deleteTarget, refetch: fetchAll };
}
