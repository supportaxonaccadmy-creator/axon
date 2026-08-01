import { memo } from 'react';
import { Coins } from 'lucide-react';
import { cn } from '@/utils/cn';
import { REWARD_TYPE_LABELS, formatRelativeTime } from '@/services/gamification';
import type { RewardPoint } from '@/services/gamification';

interface RewardHistoryProps {
  rewards: RewardPoint[];
  loading?: boolean | undefined;
  className?: string | undefined;
}

function RewardHistoryComponent({ rewards, loading, className }: RewardHistoryProps) {
  if (loading) {
    return <div className={cn('py-8 text-center text-sm text-neutral-500', className)}>Loading...</div>;
  }

  if (rewards.length === 0) {
    return <div className={cn('py-8 text-center text-sm text-neutral-500', className)}>No reward history</div>;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {rewards.map((reward) => (
        <div key={reward.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            reward.points > 0 ? 'bg-green-50' : 'bg-red-50',
          )}>
            <Coins className={cn('h-4 w-4', reward.points > 0 ? 'text-green-500' : 'text-red-500')} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900">{reward.description ?? REWARD_TYPE_LABELS[reward.type]}</p>
            <p className="text-xs text-neutral-400">
              {REWARD_TYPE_LABELS[reward.type]} · {formatRelativeTime(reward.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className={cn('text-sm font-semibold', reward.points > 0 ? 'text-green-600' : 'text-red-600')}>
              {reward.points > 0 ? '+' : ''}{reward.points}
            </p>
            <p className="text-[10px] text-neutral-400">Bal: {reward.balance}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export const RewardHistory = memo(RewardHistoryComponent);
