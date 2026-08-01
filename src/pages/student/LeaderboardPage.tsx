import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LeaderboardTable } from '@/components/gamification';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useCurrentUser } from '@/hooks/useProfile';
import { LEADERBOARD_CATEGORY_LABELS, LEADERBOARD_PERIOD_LABELS } from '@/services/gamification';
import type { LeaderboardCategory, LeaderboardPeriod } from '@/services/gamification';

export function LeaderboardPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { entries, loading, category, period, filterByCategory, filterByPeriod } = useLeaderboard();

  const topThree = useMemo(() => entries.slice(0, 3), [entries]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-neutral-500">See how you rank against other students</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">Category</label>
              <select value={category} onChange={(e) => filterByCategory(e.target.value as LeaderboardCategory)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                {Object.entries(LEADERBOARD_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">Period</label>
              <select value={period} onChange={(e) => filterByPeriod(e.target.value as LeaderboardPeriod)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                {Object.entries(LEADERBOARD_PERIOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {topThree.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {topThree.map((entry, idx) => (
            <div key={entry.id} className={`rounded-xl border-2 p-4 text-center ${idx === 0 ? 'border-yellow-300 bg-yellow-50' : idx === 1 ? 'border-gray-200 bg-gray-50' : 'border-amber-200 bg-amber-50'}`}>
              <Trophy className={`mx-auto h-8 w-8 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
              <p className="mt-2 text-sm font-semibold text-neutral-900">{entry.studentName}</p>
              <p className="text-xs text-neutral-400">Rank #{entry.rank}</p>
              <p className="mt-1 text-lg font-bold text-neutral-900">{entry.score.toLocaleString()}</p>
              {entry.studentId === studentId && <p className="text-xs text-primary-600">(You)</p>}
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Full Rankings</CardTitle></CardHeader>
        <CardContent>
          <LeaderboardTable entries={entries} currentStudentId={studentId} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
