import { memo, useEffect } from 'react';
import { BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';

function MetricsCardComponent() {
  const { metrics, refresh } = useSystemMetrics();
  useEffect(() => { refresh(); }, [refresh]);
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><BarChart3 className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">System Metrics</h3></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{metrics.map((metric) => (<div key={metric.id} className="rounded-lg bg-neutral-50 p-3"><div className="flex items-center justify-between"><p className="text-xs text-neutral-500">{metric.name}</p>{metric.status === 'healthy' ? <CheckCircle className="h-3.5 w-3.5 text-success-500" /> : <XCircle className="h-3.5 w-3.5 text-error-500" />}</div><p className="mt-1 text-lg font-bold text-neutral-900">{metric.value}<span className="text-xs font-normal text-neutral-400">{metric.unit}</span></p><p className="text-xs text-neutral-400">{metric.category}</p></div>))}</div></div>);
}
export const MetricsCard = memo(MetricsCardComponent);
