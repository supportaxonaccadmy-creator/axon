import { useMemo } from 'react';
import { Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { RewardCard, RewardHistory } from '@/components/gamification';
import { useStudentRewards } from '@/hooks/useStudentRewards';
import { useCurrentUser } from '@/hooks/useProfile';

export function MyRewardsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { rewards, balance, loading } = useStudentRewards(studentId);

  const recentRewards = useMemo(() => rewards.slice(0, 10), [rewards]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">My Rewards</h1>
        <p className="mt-1 text-sm text-neutral-500">View your reward points and history</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <RewardCard balance={balance} recentRewards={recentRewards} />
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                  <Coins className="h-4 w-4 text-amber-500" /> Full History
                </h2>
                <RewardHistory rewards={rewards} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
