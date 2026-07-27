import { memo, useMemo } from 'react';
import type { ContentDistributionData } from '@/types/adminDashboard';

interface ContentDistributionChartProps { data: ContentDistributionData[]; loading?: boolean; }

function ContentDistributionChartComponent({ data, loading = false }: ContentDistributionChartProps) {
  const { slices, total, centerX, centerY, radius } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0); const cx = 120; const cy = 120; const r = 90;
    let currentAngle = -Math.PI / 2;
    const sl = data.map((d) => {
      const angle = total > 0 ? (d.value / total) * 2 * Math.PI : 0; const startAngle = currentAngle; const endAngle = currentAngle + angle; currentAngle = endAngle;
      const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle); const x2 = cx + r * Math.cos(endAngle); const y2 = cy + r * Math.sin(endAngle); const largeArc = angle > Math.PI ? 1 : 0;
      return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, color: d.color, label: d.label, value: d.value, percent: total > 0 ? Math.round((d.value / total) * 100) : 0 };
    });
    return { slices: sl, total, centerX: cx, centerY: cy, radius: r };
  }, [data]);

  if (loading) return <div className="h-56 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Content Distribution</h3>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
        <svg viewBox="0 0 240 240" className="h-48 w-48 shrink-0" role="img" aria-label="Content distribution pie chart">
          {slices.map((s, i) => (<path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" />))}
          {total === 0 && <circle cx={centerX} cy={centerY} r={radius} fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />}
          <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="white" />
          <text x={centerX} y={centerY - 5} textAnchor="middle" className="fill-neutral-900 text-lg font-bold">{total}</text>
          <text x={centerX} y={centerY + 15} textAnchor="middle" className="fill-neutral-400 text-[10px]">Total Items</text>
        </svg>
        <div className="flex-1 space-y-1.5">{slices.map((s, i) => (<div key={i} className="flex items-center gap-2"><div className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: s.color }} /><span className="flex-1 text-xs text-neutral-600">{s.label}</span><span className="text-xs font-bold text-neutral-900">{s.value}</span><span className="text-[10px] text-neutral-400">{s.percent}%</span></div>))}</div>
      </div>
    </div>
  );
}

export const ContentDistributionChart = memo(ContentDistributionChartComponent);
