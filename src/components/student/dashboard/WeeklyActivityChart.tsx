import { memo } from 'react';
import { cn } from '@/utils/cn';
import type { WeeklyActivity } from '@/services/student/enhancedStudentDashboardService';

interface WeeklyActivityChartProps { activities: WeeklyActivity[] | null; }

function WeeklyActivityChartComponent({ activities }: WeeklyActivityChartProps) {
  const data = activities ?? [];
  const maxHours = Math.max(...data.map((d) => d.hoursStudied), 1);
  const today = new Date().getDay(); const todayIndex = (today + 6) % 7;
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-neutral-800">Weekly Activity</h3><span className="text-xs text-neutral-400">{data.reduce((sum, d) => sum + d.hoursStudied, 0)}h total</span></div>
      <div className="flex items-end justify-between gap-2" role="img" aria-label="Weekly study activity chart">
        {data.map((d, i) => { const height = maxHours > 0 ? (d.hoursStudied / maxHours) * 100 : 0; const isToday = i === todayIndex; return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5"><div className="flex h-24 w-full items-end justify-center"><div className={cn('w-full max-w-8 rounded-t-md transition-all duration-300', isToday ? 'bg-primary-500' : d.hoursStudied > 0 ? 'bg-primary-300' : 'bg-neutral-100')} style={{ height: `${Math.max(height, 4)}%` }} title={`${d.day}: ${d.hoursStudied}h`} /></div><span className={cn('text-[10px] font-medium', isToday ? 'text-primary-600' : 'text-neutral-400')}>{d.day}</span></div>
        ); })}
      </div>
    </div>
  );
}

export const WeeklyActivityChart = memo(WeeklyActivityChartComponent);
