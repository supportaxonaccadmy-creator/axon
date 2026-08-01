import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { AchievementCard } from '@/components/gamification';
import { useAchievements } from '@/hooks/useAchievements';
import { useCurrentUser } from '@/hooks/useProfile';

export function MyAchievementsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { achievements, studentAchievements, loading } = useAchievements(studentId, false);

  const unlockedIds = useMemo(() => new Set(studentAchievements.map((sa) => sa.achievementId)), [studentAchievements]);
  const unlockedMap = useMemo(() => {
    const map = new Map<string, string>();
    studentAchievements.forEach((sa) => map.set(sa.achievementId, sa.awardedAt));
    return map;
  }, [studentAchievements]);

  const unlocked = achievements.filter((a) => unlockedIds.has(a.id));
  const locked = achievements.filter((a) => !unlockedIds.has(a.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">My Achievements</h1>
        <p className="mt-1 text-sm text-neutral-500">{unlocked.length} unlocked · {locked.length} locked</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading...</div>
      ) : (
        <>
          {unlocked.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <Trophy className="h-4 w-4 text-primary-500" /> Unlocked ({unlocked.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {unlocked.map((a) => (
                  <AchievementCard key={a.id} achievement={a} unlocked unlockedAt={unlockedMap.get(a.id)} />
                ))}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-neutral-700">Locked ({locked.length})</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {locked.map((a) => (
                  <AchievementCard key={a.id} achievement={a} />
                ))}
              </div>
            </div>
          )}

          {achievements.length === 0 && (
            <Card><CardContent className="py-12 text-center"><Trophy className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No achievements available</p></CardContent></Card>
          )}
        </>
      )}
    </div>
  );
}
