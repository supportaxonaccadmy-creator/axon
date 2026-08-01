import { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '@/services/gamification';
import type { LeaderboardEntry, LeaderboardCategory, LeaderboardPeriod } from '@/services/gamification';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<LeaderboardCategory>('xp');
  const [period, setPeriod] = useState<LeaderboardPeriod>('global');
  const [batchId, setBatchId] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await leaderboardService.getLeaderboard({
      category, period, batchId, limit: 50,
    });
    if (err) setError(err);
    else { setEntries(data); setError(null); }
    setLoading(false);
  }, [category, period, batchId]);

  useEffect(() => { void fetchLeaderboard(); }, [fetchLeaderboard]);

  const filterByCategory = useCallback((cat: LeaderboardCategory) => setCategory(cat), []);
  const filterByPeriod = useCallback((p: LeaderboardPeriod) => setPeriod(p), []);
  const filterByBatch = useCallback((bid: string | null) => setBatchId(bid), []);

  return {
    entries, loading, error,
    category, period, batchId,
    filterByCategory, filterByPeriod, filterByBatch,
    refetch: fetchLeaderboard,
  };
}