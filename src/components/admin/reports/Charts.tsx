import { memo, useMemo } from 'react';
import { cn } from '@/utils/cn';

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

function BarChartComponent({ data, color = '#3b82f6', height = 200, formatValue }: BarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const bars = useMemo(() => data.map((d) => ({ ...d, pct: Math.round((d.value / maxValue) * 100) })), [data, maxValue]);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-neutral-600">{formatValue ? formatValue(bar.value) : bar.value}</span>
          <div className="relative w-full overflow-hidden rounded-t-md bg-neutral-100" style={{ height: height - 40 }}>
            <div className="absolute bottom-0 w-full rounded-t-md transition-all duration-500" style={{ height: `${bar.pct}%`, backgroundColor: color }} />
          </div>
          <span className="truncate text-[10px] text-neutral-500" style={{ maxWidth: 60 }}>{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export const BarChart = memo(BarChartComponent);

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  height?: number;
}

function LineChartComponent({ data, color = '#3b82f6', height = 200 }: LineChartProps) {
  const { points, maxValue, minValue } = useMemo(() => {
    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const w = 100;
    const h = height - 40;
    const pts = data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * w : 50;
      const y = h - ((d.value - min) / range) * h;
      return { x, y, label: d.label, value: d.value };
    });
    return { points: pts, maxValue: max, minValue: min };
  }, [data, height]);

  const pathD = useMemo(() => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '), [points]);
  const areaD = useMemo(() => `${pathD} L 100 ${height - 40} L 0 ${height - 40} Z`, [pathD, height]);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="h-full w-full" style={{ height: height - 40 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGradient)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between px-1">
        {data.map((d) => (<span key={d.label} className="text-[10px] text-neutral-500">{d.label}</span>))}
      </div>
      <div className="absolute right-0 top-0 text-[10px] text-neutral-400">Max: {maxValue}</div>
      <div className="absolute right-0 bottom-8 text-[10px] text-neutral-400">Min: {minValue}</div>
    </div>
  );
}

export const LineChart = memo(LineChartComponent);

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}

function DonutChartComponent({ data, size = 180 }: DonutChartProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {total > 0 && data.map((d) => {
          const pct = d.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const circle = (
            <circle
              key={d.label} cx={size / 2} cy={size / 2} r={radius} fill="none"
              stroke={d.color} strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += dash;
          return circle;
        })}
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="fill-neutral-900 text-lg font-bold">{total}</text>
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-neutral-600">{d.label}</span>
            <span className="text-sm font-semibold text-neutral-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const DonutChart = memo(DonutChartComponent);

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: typeof import('lucide-react').Users | undefined;
  color?: string;
  hint?: string;
}

function StatCardComponent({ label, value, icon: Icon, color = 'text-primary-600 bg-primary-50', hint }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      {Icon && <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', color)}><Icon className="h-4 w-4" /></div>}
      <div><p className="text-xl font-bold text-neutral-900">{value}</p><p className="text-xs text-neutral-500">{label}</p></div>
      {hint && <p className="text-[10px] text-neutral-400">{hint}</p>}
    </div>
  );
}

export const StatCard = memo(StatCardComponent);
