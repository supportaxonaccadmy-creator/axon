import { memo } from 'react';
import { Heart, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { HealthCheck } from '@/services/monitoring';
import { getHealthStatusColor } from '@/services/monitoring';

interface SystemHealthCardProps { checks: HealthCheck[]; }

function SystemHealthCardComponent({ checks }: SystemHealthCardProps) {
  const healthy = checks.filter((c) => c.status === 'healthy').length;
  const total = checks.length;
  const score = total > 0 ? Math.round((healthy / total) * 100) : 0;
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Heart className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">System Health</h3><span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${score === 100 ? 'bg-success-50 text-success-700' : score >= 60 ? 'bg-warning-50 text-warning-700' : 'bg-error-50 text-error-700'}`}>{score}%</span></div><div className="space-y-2">{checks.map((check) => (<div key={check.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-2.5 text-xs"><div className="flex items-center gap-2">{check.status === 'healthy' ? <CheckCircle className="h-4 w-4 text-success-500" /> : check.status === 'degraded' ? <AlertTriangle className="h-4 w-4 text-warning-500" /> : <XCircle className="h-4 w-4 text-error-500" />}<span className="font-medium text-neutral-700">{check.component}</span></div><div className="flex items-center gap-2"><span className="text-neutral-400">{check.message}</span><span className={`rounded-full px-2 py-0.5 font-medium ${getHealthStatusColor(check.status)}`}>{check.status}</span></div></div>))}</div></div>);
}
export const SystemHealthCard = memo(SystemHealthCardComponent);
