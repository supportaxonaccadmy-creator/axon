import { useState, useEffect, useCallback } from 'react';
import { rewardService, missionService } from '@/services/gamification';
import type { RewardPoint, Mission, StudentMission } from '@/services/gamification';

export function useStudentRewards(studentId: string | null) {
  const [rewards, setRewards] = useState<RewardPoint[]>([]);
  const [balance, setBalance] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [studentMissions, setStudentMissions] = useState<StudentMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const [rewardsRes, balanceRes, missionsRes, studentMissionsRes] = await Promise.all([
      rewardService.getByStudent(studentId),
      rewardService.getBalance(studentId),
      missionService.getAll(),
      missionService.getByStudent(studentId),
    ]);
    if (rewardsRes.error) setError(rewardsRes.error);
    else { setRewards(rewardsRes.data); setError(null); }
    setBalance(balanceRes.data);
    setMissions(missionsRes.data);
    setStudentMissions(studentMissionsRes.data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const claimMission = useCallback(async (missionId: string) => {
    if (!studentId) return;
    const { error: err } = await missionService.claimReward(studentId, missionId);
    if (!err) void fetchAll();
    return { error: err };
  }, [studentId, fetchAll]);

  return {
    rewards, balance, missions, studentMissions,
    loading, error,
    claimMission,
    refetch: fetchAll,
  };
}