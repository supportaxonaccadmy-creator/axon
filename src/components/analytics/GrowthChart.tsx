import { memo, useMemo } from 'react';

interface GrowthChartProps { data: Array<{ label: string; value: number }>; height?: number; color?: string; fillOpacity?: number; }

function GrowthChartComponent({ data, height = 200, color = '#22c55e', fillOpacity = 0.15 }: GrowthChartProps) {
  const { pathD, areaD } = useMemo(() => {
    if (data.length === 0) return { pathD: '', areaD: '' };
    const maxVal = Math.max(...data.map((d) => d.value), 1); const w = 100; const h = height;
    const step = data.length > 1 ? w / (data.length - 1) : 0;
    const points = data.map((d, i) => ({ x: i * step, y: h - (d.value / maxVal) * (h - 20) - 10 }));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${path} L ${w} ${h} L 0 ${h} Z`;
    return { pathD: path, areaD: area };
  }, [data, height]);
  if (data.length === 0) return <div className="flex items-center justify-center text-sm text-neutral-400" style={{ height }}>No growth data</div>;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <path d={areaD} fill={color} fillOpacity={fillOpacity} /><path d={pathD} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-neutral-400">{data.map((d, i) => <span key={i} className="truncate">{d.label}</span>)}</div>
    </div>
  );
}
export const GrowthChart = memo(GrowthChartComponent);
