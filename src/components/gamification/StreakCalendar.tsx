import { memo, useMemo } from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StreakCalendarProps {
  currentStreak: number;
  lastStudyDate: string | null;
  className?: string | undefined;
}

function StreakCalendarComponent({ currentStreak, lastStudyDate, className }: StreakCalendarProps) {
  const days = useMemo(() => {
    const today = new Date();
    const result: Array<{ date: Date; active: boolean; isToday: boolean }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0] ?? '';
      const lastStr = lastStudyDate ?? '';
      const active = dateStr <= lastStr && currentStreak > 0;
      result.push({ date, active, isToday: i === 0 });
    }
    return result;
  }, [currentStreak, lastStudyDate]);

  return (
    <div className={cn('flex items-center justify-between gap-1.5', className)}>
      {days.map((day, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <p className="text-[10px] text-neutral-400">{day.date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</p>
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium',
            day.active ? 'bg-orange-100 text-orange-600' : day.isToday ? 'border-2 border-primary-200 text-neutral-400' : 'bg-neutral-50 text-neutral-300',
          )}>
            {day.active ? <Flame className="h-4 w-4" /> : day.date.getDate()}
          </div>
        </div>
      ))}
    </div>
  );
}

export const StreakCalendar = memo(StreakCalendarComponent);
