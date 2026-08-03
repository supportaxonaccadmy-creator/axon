import { memo, useMemo } from 'react';
import { cn } from '@/utils/cn';

interface HeatMapProps { data: Array<{ day: string; hour: number; value: number }>; maxValue?: number; }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function HeatMapComponent({ data, maxValue }: HeatMapProps) {
  const max = useMemo(() => maxValue ?? Math.max(...data.map((d) => d.value), 1), [data, maxValue]);
  const grid = useMemo(() => { const map = new Map<string, number>(); for (const d of data) map.set(`${d.day}-${d.hour}`, d.value); return map; }, [data]);
  const getColor = (value: number) => { const intensity = value / max; if (intensity === 0) return 'bg-neutral-100'; if (intensity < 0.25) return 'bg-primary-100'; if (intensity < 0.5) return 'bg-primary-300'; if (intensity < 0.75) return 'bg-primary-500'; return 'bg-primary-700'; };
  return (
    <div className="overflow-x-auto"><div className="inline-grid" style={{ gridTemplateColumns: 'auto repeat(24, minmax(20px, 1fr))' }}>
      <div />{Array.from({ length: 24 }, (_, h) => <div key={h} className="text-center text-[9px] text-neutral-400">{h}</div>)}
      {DAYS.map((day) => (<div key={day} className="contents"><div className="flex items-center pr-2 text-xs font-medium text-neutral-500">{day}</div>
        {Array.from({ length: 24 }, (_, h) => { const value = grid.get(`${day}-${h}`) ?? 0; return <div key={`${day}-${h}`} className={cn('m-0.5 h-6 rounded transition-all hover:ring-2 hover:ring-primary-300', getColor(value))} title={`${day} ${h}:00 - ${value}`} />; })}
      </div>))}
    </div></div>
  );
}
export const HeatMap = memo(HeatMapComponent);
