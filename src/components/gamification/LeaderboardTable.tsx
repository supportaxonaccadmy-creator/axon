import { memo } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getRankColor } from '@/services/gamification';
import type { LeaderboardEntry } from '@/services/gamification';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentStudentId?: string | null;
  loading?: boolean | undefined;
  className?: string | undefined;
}

function LeaderboardTableComponent({ entries, currentStudentId, loading, className }: LeaderboardTableProps) {
  if (loading) {
    return <div className={cn('py-8 text-center text-sm text-neutral-500', className)}>Loading leaderboard...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <Trophy className="mx-auto h-10 w-10 text-neutral-300" />
        <p className="mt-2 text-sm text-neutral-500">No entries yet</p>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return null;
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
            <th className="pb-2 pr-4 font-medium">Rank</th>
            <th className="pb-2 pr-4 font-medium">Student</th>
            <th className="pb-2 pr-4 font-medium text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className={cn(
                'border-b border-neutral-50',
                entry.studentId === currentStudentId && 'bg-primary-50/50',
              )}
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-1.5">
                  {getRankIcon(entry.rank) ?? <span className={cn('text-sm font-medium', getRankColor(entry.rank))}>{entry.rank}</span>}
                </div>
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-500">
                      {entry.studentName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-neutral-900">{entry.studentName}</span>
                  {entry.studentId === currentStudentId && <span className="text-xs text-primary-600">(You)</span>}
                </div>
              </td>
              <td className="py-3 pr-4 text-right font-semibold text-neutral-900">{entry.score.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const LeaderboardTable = memo(LeaderboardTableComponent);
