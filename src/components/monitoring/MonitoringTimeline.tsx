import { memo } from 'react';
import { GitBranch, CheckCircle, XCircle } from 'lucide-react';
import { auditMonitoringService } from '@/services/monitoring';

function MonitoringTimelineComponent() {
  const events = auditMonitoringService.getEvents(undefined, undefined, 20);
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><GitBranch className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Monitoring Timeline</h3></div><div className="relative space-y-3 before:absolute before:left-2 before:top-0 before:h-full before:w-px before:bg-neutral-200">{events.map((event) => (<div key={event.id} className="relative pl-8"><div className={`absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${event.outcome === 'success' ? 'border-success-500 bg-white' : 'border-error-500 bg-white'}`}>{event.outcome === 'success' ? <CheckCircle className="h-3 w-3 text-success-500" /> : <XCircle className="h-3 w-3 text-error-500" />}</div><div className="flex items-center gap-2"><span className="text-xs font-medium text-neutral-700">{event.action}</span><span className="text-xs text-neutral-400">{event.module}</span><span className="ml-auto text-xs text-neutral-400">{new Date(event.timestamp).toLocaleTimeString()}</span></div>{event.details && <p className="mt-0.5 text-xs text-neutral-500">{event.details}</p>}</div>))}{events.length === 0 && <p className="text-sm text-neutral-400">No monitoring events yet.</p>}</div></div>);
}
export const MonitoringTimeline = memo(MonitoringTimelineComponent);
