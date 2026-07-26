import { memo } from 'react';
import { Flame, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StudyStreak } from '@/services/student/enhancedStudentDashboardService';

interface StudyStreakCardProps { streak: StudyStreak | null; }

function StudyStreakCardComponent({ streak }: StudyStreakCardProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const activeDays = streak?.thisWeekActive ?? [false, false, false, false, false, false, false];
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-50"><Flame className="h-5 w-5 text-warning-600" strokeWidth={2} /></div><div><p className="text-2xl font-bold text-neutral-900">{streak?.currentStreak ?? 0}</p><p className="text-xs text-neutral-500">Day Streak</p></div></div>
        <div className="text-right"><p className="text-xs text-neutral-400">Best</p><p className="text-sm font-bold text-neutral-700">{streak?.longestStreak ?? 0} days</p></div>
      </div>
      <div className="flex items-center justify-between">
        {days.map((day, i) => (<div key={i} className="flex flex-col items-center gap-1"><span className="text-[10px] font-medium text-neutral-400">{day}</span><div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors', activeDays[i] ? 'bg-warning-500 text-white' : 'bg-neutral-100 text-neutral-400')}>{activeDays[i] ? <Flame className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}</div></div>))}
      </div>
    </div>
  );
}

export const StudyStreakCard = memo(StudyStreakCardComponent);
