import { memo } from 'react';
import { Gift, Coins } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { REWARD_TYPE_LABELS, formatRelativeTime } from '@/services/gamification';
import type { RewardPoint } from '@/services/gamification';

interface RewardCardProps {
  balance: number;
  recentRewards: RewardPoint[];
  className?: string | undefined;
}

function RewardCardComponent({ balance, recentRewards, className }: RewardCardProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Card hover>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50">
            <Coins className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{balance.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Reward Points</p>
          </div>
        </CardContent>
      </Card>

      {recentRewards.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-neutral-500">Recent Activity</p>
          {recentRewards.slice(0, 5).map((reward) => (
            <div key={reward.id} className="flex items-center gap-2 rounded-lg border border-neutral-100 p-2.5">
              <Gift className={cn('h-4 w-4', reward.points > 0 ? 'text-green-500' : 'text-red-500')} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-700">{reward.description ?? REWARD_TYPE_LABELS[reward.type]}</p>
                <p className="text-[10px] text-neutral-400">{formatRelativeTime(reward.createdAt)}</p>
              </div>
              <span className={cn('text-xs font-semibold', reward.points > 0 ? 'text-green-600' : 'text-red-600')}>
                {reward.points > 0 ? '+' : ''}{reward.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const RewardCard = memo(RewardCardComponent);
