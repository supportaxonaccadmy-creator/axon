import { memo } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getRankColor } from '@/services/gamification';
import type { LeaderboardEntry } from '@/services/gamification';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean | undefined;
  className?: string | undefined;
}

function LeaderboardCardComponent({ entry, isCurrentUser = false, className }: LeaderboardCardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Trophy className={cn('h-5 w-5', getRankColor(rank))} />;
  };

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm',
      isCurrentUser ? 'border-primary-300 ring-1 ring-primary-100' : 'border-neutral-200',
      className,
    )}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        {getRankIcon(entry.rank)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900">{entry.studentName}</p>
        <p className="text-xs text-neutral-400">Rank #{entry.rank}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-neutral-900">{entry.score.toLocaleString()}</p>
        <p className="text-[10px] text-neutral-400">points</p>
      </div>
    </div>
  );
}

export const LeaderboardCard = memo(LeaderboardCardComponent);
