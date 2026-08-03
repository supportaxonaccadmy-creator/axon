import { memo } from 'react';
import { Zap, Clock, Eye, Activity } from 'lucide-react';
import { usePerformance } from '@/hooks/usePerformance';
import { performanceService } from '@/services/pwa';

function PerformanceCardComponent() {
  const { metrics } = usePerformance();
  const items = [
    { label: 'Load Time', value: metrics.loadTime, icon: Clock, format: (v: number) => performanceService.formatMetric(v) },
    { label: 'FCP', value: metrics.firstContentfulPaint, icon: Eye, format: (v: number) => performanceService.formatMetric(v) },
    { label: 'LCP', value: metrics.largestContentfulPaint, icon: Activity, format: (v: number) => performanceService.formatMetric(v) },
    { label: 'TTI', value: metrics.timeToInteractive, icon: Zap, format: (v: number) => performanceService.formatMetric(v) },
  ];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50"><Zap className="h-4 w-4 text-accent-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Performance Metrics</h3></div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg bg-neutral-50 p-3 text-center">
            <item.icon className="mx-auto mb-1 h-4 w-4 text-neutral-400" />
            <p className="text-lg font-bold text-neutral-900">{item.value ? item.format(item.value) : '--'}</p>
            <p className="text-xs text-neutral-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export const PerformanceCard = memo(PerformanceCardComponent);
