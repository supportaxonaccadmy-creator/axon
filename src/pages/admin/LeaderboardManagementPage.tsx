import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LeaderboardTable } from '@/components/gamification';
import { leaderboardService } from '@/services/gamification';
import { LEADERBOARD_CATEGORY_LABELS, LEADERBOARD_PERIOD_LABELS } from '@/services/gamification';
import type { LeaderboardEntry, LeaderboardCategory, LeaderboardPeriod } from '@/services/gamification';

export function LeaderboardManagementPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<LeaderboardCategory>('xp');
  const [period, setPeriod] = useState<LeaderboardPeriod>('global');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await leaderboardService.getLeaderboard({ category, period, limit: 50 });
      setEntries(data);
      setLoading(false);
    };
    void fetch();
  }, [category, period]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-neutral-500">View student rankings</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as LeaderboardCategory)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                {Object.entries(LEADERBOARD_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">Period</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                {Object.entries(LEADERBOARD_PERIOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary-500" /> Rankings</CardTitle></CardHeader>
        <CardContent>
          <LeaderboardTable entries={entries} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
