import { useState, useEffect, useCallback } from 'react';
import { achievementService, badgeService } from '@/services/gamification';
import type { Achievement, StudentAchievement, Badge, StudentBadge } from '@/services/gamification';

export function useAchievements(studentId: string | null, isAdmin: boolean = false) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studentAchievements, setStudentAchievements] = useState<StudentAchievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    if (isAdmin) {
      const [achRes, badgeRes] = await Promise.all([
        achievementService.getAllAdmin(),
        badgeService.getAllAdmin(),
      ]);
      if (achRes.error) setError(achRes.error);
      else { setAchievements(achRes.data); setError(null); }
      if (badgeRes.error) setError(badgeRes.error);
      else setBadges(badgeRes.data);
    } else {
      const [achRes, badgeRes] = await Promise.all([
        achievementService.getAll(),
        badgeService.getAll(),
      ]);
      setAchievements(achRes.data);
      setBadges(badgeRes.data);
      if (studentId) {
        const [studentAchRes, studentBadgeRes] = await Promise.all([
          achievementService.getByStudent(studentId),
          badgeService.getByStudent(studentId),
        ]);
        setStudentAchievements(studentAchRes.data);
        setStudentBadges(studentBadgeRes.data);
      }
    }
    setLoading(false);
  }, [studentId, isAdmin]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const createAchievement = useCallback(async (adminId: string, input: Parameters<typeof achievementService.create>[1]) => {
    const { data, error: err } = await achievementService.create(adminId, input);
    if (!err) void fetchAll();
    return { data, error: err };
  }, [fetchAll]);

  const deleteAchievement = useCallback(async (id: string) => {
    const { error: err } = await achievementService.delete(id);
    if (!err) void fetchAll();
    return { error: err };
  }, [fetchAll]);

  const createBadge = useCallback(async (adminId: string, input: Parameters<typeof badgeService.create>[1]) => {
    const { data, error: err } = await badgeService.create(adminId, input);
    if (!err) void fetchAll();
    return { data, error: err };
  }, [fetchAll]);

  const deleteBadge = useCallback(async (id: string) => {
    const { error: err } = await badgeService.delete(id);
    if (!err) void fetchAll();
    return { error: err };
  }, [fetchAll]);

  return {
    achievements, studentAchievements, badges, studentBadges,
    loading, error,
    createAchievement, deleteAchievement,
    createBadge, deleteBadge,
    refetch: fetchAll,
  };
}