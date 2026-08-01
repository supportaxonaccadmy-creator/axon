import { useMemo } from 'react';
import { Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { BadgeCard } from '@/components/gamification';
import { useAchievements } from '@/hooks/useAchievements';
import { useCurrentUser } from '@/hooks/useProfile';

export function MyBadgesPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { badges, studentBadges, loading } = useAchievements(studentId, false);

  const earnedIds = useMemo(() => new Set(studentBadges.map((sb) => sb.badgeId)), [studentBadges]);
  const earnedMap = useMemo(() => {
    const map = new Map<string, string>();
    studentBadges.forEach((sb) => map.set(sb.badgeId, sb.awardedAt));
    return map;
  }, [studentBadges]);

  const earned = badges.filter((b) => earnedIds.has(b.id));
  const locked = badges.filter((b) => !earnedIds.has(b.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">My Badges</h1>
        <p className="mt-1 text-sm text-neutral-500">{earned.length} earned · {locked.length} locked</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading...</div>
      ) : (
        <>
          {earned.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-neutral-700">Earned ({earned.length})</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {earned.map((b) => (
                  <BadgeCard key={b.id} badge={b} earned earnedAt={earnedMap.get(b.id)} />
                ))}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-neutral-700">Locked ({locked.length})</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {locked.map((b) => (
                  <BadgeCard key={b.id} badge={b} />
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <Card><CardContent className="py-12 text-center"><Award className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No badges available</p></CardContent></Card>
          )}
        </>
      )}
    </div>
  );
}
