import { useState, useEffect, useCallback } from 'react';
import { xpService, levelService, streakService } from '@/services/gamification';
import type { StudentXp, StudentLevel, StudyStreak } from '@/services/gamification';
import { calculateLevel, getXpProgress } from '@/services/gamification';

export function useGamification(studentId: string | null) {
  const [xp, setXp] = useState<StudentXp | null>(null);
  const [level, setLevel] = useState<StudentLevel | null>(null);
  const [streak, setStreak] = useState<StudyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const [xpRes, levelRes, streakRes] = await Promise.all([
      xpService.getByStudent(studentId),
      levelService.getByStudent(studentId),
      streakService.getByStudent(studentId),
    ]);
    if (xpRes.error) setError(xpRes.error);
    else { setXp(xpRes.data); setError(null); }
    setLevel(levelRes.data);
    setStreak(streakRes.data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const totalXp = xp?.totalXp ?? 0;
  const levelInfo = calculateLevel(totalXp);
  const xpProgress = getXpProgress(totalXp);

  const awardXp = useCallback(async (amount: number, reason: string) => {
    if (!studentId) return;
    const { error: err } = await xpService.award({ studentId, amount, reason });
    if (!err) void fetchAll();
    return { error: err };
  }, [studentId, fetchAll]);

  const recordStudy = useCallback(async () => {
    if (!studentId) return;
    const { error: err } = await streakService.recordStudy(studentId);
    if (!err) void fetchAll();
    return { error: err };
  }, [studentId, fetchAll]);

  return {
    xp, level, streak,
    totalXp, levelInfo, xpProgress,
    loading, error,
    awardXp, recordStudy,
    refetch: fetchAll,
  };
}