import { memo, useMemo } from 'react';

interface LearningGraphProps { data: Array<{ label: string; value: number }>; height?: number; color?: string; }

function LearningGraphComponent({ data, height = 200, color = '#3b82f6' }: LearningGraphProps) {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const width = 100; const step = data.length > 1 ? width / (data.length - 1) : 0;
    return data.map((d, i) => { const x = i * step; const y = height - (d.value / maxVal) * (height - 20) - 10; return `${x},${y}`; }).join(' ');
  }, [data, height]);
  if (data.length === 0) return <div className="flex items-center justify-center text-sm text-neutral-400" style={{ height }}>No data</div>;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-neutral-400">{data.map((d, i) => <span key={i} className="truncate">{d.label}</span>)}</div>
    </div>
  );
}
export const LearningGraph = memo(LearningGraphComponent);
