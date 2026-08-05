import { memo, useEffect } from 'react';
import { Gauge, CheckCircle, XCircle } from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

function PerformanceCardComponent() {
  const { metrics, performanceScore, refresh } = usePerformanceMonitoring();
  useEffect(() => { refresh(); }, [refresh]);
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Gauge className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Performance Monitoring</h3><span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${performanceScore >= 90 ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>{performanceScore}%</span></div><div className="space-y-1.5">{metrics.map((metric) => (<div key={metric.id} className="flex items-center justify-between text-xs"><span className="text-neutral-600">{metric.name}</span><div className="flex items-center gap-2"><span className="font-mono text-neutral-400">{metric.value}{metric.unit}</span>{metric.status === 'healthy' ? <CheckCircle className="h-3.5 w-3.5 text-success-500" /> : <XCircle className="h-3.5 w-3.5 text-error-500" />}</div></div>))}</div></div>);
}
export const PerformanceCard = memo(PerformanceCardComponent);
