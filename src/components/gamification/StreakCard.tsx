import { memo } from 'react';
import { Flame, Snowflake } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  freezeDays?: number | undefined;
  className?: string | undefined;
}

function StreakCardComponent({ currentStreak, longestStreak, freezeDays = 0, className }: StreakCardProps) {
  return (
    <Card hover className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            currentStreak > 0 ? 'bg-orange-50' : 'bg-neutral-100',
          )}>
            <Flame className={cn('h-6 w-6', currentStreak > 0 ? 'text-orange-500' : 'text-neutral-300')} />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-neutral-900">{currentStreak}</p>
            <p className="text-xs text-neutral-500">Day Streak</p>
          </div>
          {freezeDays > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-500">
              <Snowflake className="h-3.5 w-3.5" /> {freezeDays}
            </div>
          )}
        </div>
        <div className="mt-3 border-t border-neutral-100 pt-2">
          <p className="text-xs text-neutral-400">Longest: <span className="font-medium text-neutral-700">{longestStreak} days</span></p>
        </div>
      </CardContent>
    </Card>
  );
}

export const StreakCard = memo(StreakCardComponent);
