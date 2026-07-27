import { memo, useMemo } from 'react';
import type { RevenueDataPoint } from '@/types/adminDashboard';

interface RevenueChartProps { data: RevenueDataPoint[]; loading?: boolean; }

function RevenueChartComponent({ data, loading = false }: RevenueChartProps) {
  const { points, chartHeight, chartWidth, padding } = useMemo(() => {
    const w = 600; const h = 200; const p = 40;
    const max = Math.max(...data.map((d) => d.value), 1); const min = Math.min(...data.map((d) => d.value), 0); const range = max - min || 1;
    const stepX = data.length > 1 ? (w - p * 2) / (data.length - 1) : 0;
    const pts = data.map((d, i) => ({ x: p + i * stepX, y: h - p - ((d.value - min) / range) * (h - p * 2), label: d.label, value: d.value }));
    return { points: pts, chartHeight: h, chartWidth: w, padding: p };
  }, [data]);

  if (loading) return <div className="h-56 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  const linePath = points.length > 0 ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') : '';
  const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1]!.x} ${chartHeight - padding} L ${points[0]!.x} ${chartHeight - padding} Z` : '';

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Revenue Trend</h3>
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ minWidth: 300 }} role="img" aria-label="Revenue trend chart">
          <defs><linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (<line key={t} x1={padding} y1={padding + t * (chartHeight - padding * 2)} x2={chartWidth - padding} y2={padding + t * (chartHeight - padding * 2)} stroke="#f3f4f6" strokeWidth="1" />))}
          {areaPath && <path d={areaPath} fill="url(#revenueGrad)" />}
          {linePath && <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
          {points.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" /><text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-neutral-600 text-[10px] font-medium">₹{(p.value / 1000).toFixed(0)}k</text><text x={p.x} y={chartHeight - padding + 20} textAnchor="middle" className="fill-neutral-400 text-[10px]">{p.label}</text></g>))}
        </svg>
      </div>
    </div>
  );
}

export const RevenueChart = memo(RevenueChartComponent);
