import { memo, useMemo } from 'react';
import { cn } from '@/utils/cn';

interface EngagementChartProps {
  data: Array<{ date: string; engagementScore: number }>;
  height?: number;
}

function EngagementChartComponent({ data, height = 180 }: EngagementChartProps) {
  const bars = useMemo(() => {
    if (data.length === 0) return [];
    const maxVal = Math.max(...data.map((d) => d.engagementScore), 100);
    return data.map((d) => ({
      label: d.date.split('-').slice(1).join('/'),
      height: (d.engagementScore / maxVal) * 100,
      value: d.engagementScore,
    }));
  }, [data]);

  if (data.length === 0) return <div className="flex items-center justify-center text-sm text-neutral-400" style={{ height }}>No engagement data</div>;

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {bars.map((bar, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div className="w-full overflow-hidden rounded-t" style={{ height: `${bar.height}%` }}>
            <div className={cn('h-full w-full rounded-t bg-primary-500 transition-all hover:bg-primary-600')} />
          </div>
          <span className="text-[10px] text-neutral-400">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export const EngagementChart = memo(EngagementChartComponent);
