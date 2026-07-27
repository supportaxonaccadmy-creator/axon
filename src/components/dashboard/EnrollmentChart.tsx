import { memo, useMemo } from 'react';
import type { EnrollmentDataPoint } from '@/types/adminDashboard';

interface EnrollmentChartProps { data: EnrollmentDataPoint[]; loading?: boolean; }

function EnrollmentChartComponent({ data, loading = false }: EnrollmentChartProps) {
  const { bars, chartHeight, chartWidth, padding } = useMemo(() => {
    const w = 600; const h = 200; const p = 40;
    const max = Math.max(...data.map((d) => d.value), 1);
    const barWidth = data.length > 0 ? (w - p * 2) / data.length * 0.6 : 0; const gap = data.length > 0 ? (w - p * 2) / data.length * 0.4 : 0;
    const bs = data.map((d, i) => ({ x: p + i * (barWidth + gap) + gap / 2, y: h - p - (d.value / max) * (h - p * 2), width: barWidth, height: (d.value / max) * (h - p * 2), label: d.label, value: d.value }));
    return { bars: bs, chartHeight: h, chartWidth: w, padding: p };
  }, [data]);

  if (loading) return <div className="h-56 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Enrollment Trend</h3>
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ minWidth: 300 }} role="img" aria-label="Enrollment trend chart">
          <defs><linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient></defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (<line key={t} x1={padding} y1={padding + t * (chartHeight - padding * 2)} x2={chartWidth - padding} y2={padding + t * (chartHeight - padding * 2)} stroke="#f3f4f6" strokeWidth="1" />))}
          {bars.map((b, i) => (<g key={i}><rect x={b.x} y={b.y} width={b.width} height={b.height} rx="4" fill="url(#enrollGrad)" /><text x={b.x + b.width / 2} y={b.y - 8} textAnchor="middle" className="fill-neutral-600 text-[10px] font-medium">{b.value}</text><text x={b.x + b.width / 2} y={chartHeight - padding + 20} textAnchor="middle" className="fill-neutral-400 text-[10px]">{b.label}</text></g>))}
        </svg>
      </div>
    </div>
  );
}

export const EnrollmentChart = memo(EnrollmentChartComponent);
