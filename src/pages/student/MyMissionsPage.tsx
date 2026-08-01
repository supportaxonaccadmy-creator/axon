import { useMemo } from 'react';
import { Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { MissionCard } from '@/components/gamification';
import { useStudentRewards } from '@/hooks/useStudentRewards';
import { useCurrentUser } from '@/hooks/useProfile';

export function MyMissionsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { missions, studentMissions, loading, claimMission } = useStudentRewards(studentId);

  const missionMap = useMemo(() => {
    const map = new Map<string, typeof studentMissions[number]>();
    studentMissions.forEach((sm) => map.set(sm.missionId, sm));
    return map;
  }, [studentMissions]);

  const daily = missions.filter((m) => m.type === 'daily');
  const weekly = missions.filter((m) => m.type === 'weekly');
  const monthly = missions.filter((m) => m.type === 'monthly');
  const custom = missions.filter((m) => m.type === 'custom');

  const renderMissions = (list: typeof missions, title: string) => {
    if (list.length === 0) return null;
    return (
      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">{title}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              studentMission={missionMap.get(m.id)}
              onClaim={(id) => void claimMission(id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">My Missions</h1>
        <p className="mt-1 text-sm text-neutral-500">Complete missions to earn XP and reward points</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading...</div>
      ) : missions.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Target className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No missions available</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {renderMissions(daily, 'Daily Missions')}
          {renderMissions(weekly, 'Weekly Missions')}
          {renderMissions(monthly, 'Monthly Missions')}
          {renderMissions(custom, 'Custom Missions')}
        </div>
      )}
    </div>
  );
}
