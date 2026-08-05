import { memo, useState, useEffect } from 'react';
import { ScrollText, Info, AlertTriangle, AlertCircle, Bug, FileCheck } from 'lucide-react';
import { loggingService } from '@/services/monitoring';
import type { LogLevel, LogEntry } from '@/services/monitoring';
import { getLogLevelColor } from '@/services/monitoring';

function LogsViewerComponent() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  useEffect(() => { setLogs(loggingService.getLogs(undefined, undefined, 100)); }, []);
  const filtered = filter === 'all' ? logs : logs.filter((l) => l.level === filter);
  const counts = loggingService.getLogCounts();
  const levelIcon = (level: LogLevel) => { switch (level) { case 'info': return <Info className="h-3.5 w-3.5 text-primary-500" />; case 'warning': return <AlertTriangle className="h-3.5 w-3.5 text-warning-500" />; case 'error': return <AlertCircle className="h-3.5 w-3.5 text-error-500" />; case 'critical': return <AlertCircle className="h-3.5 w-3.5 text-error-600" />; case 'debug': return <Bug className="h-3.5 w-3.5 text-neutral-400" />; case 'audit': return <FileCheck className="h-3.5 w-3.5 text-accent-500" />; } };
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><ScrollText className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Application Logs</h3></div><div className="mb-3 flex flex-wrap gap-1.5"><button onClick={() => setFilter('all')} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${filter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-50 text-neutral-500'}`}>All ({loggingService.getTotalLogs()})</button>{(['info', 'warning', 'error', 'critical', 'debug', 'audit'] as LogLevel[]).map((lvl) => (<button key={lvl} onClick={() => setFilter(lvl)} className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${filter === lvl ? 'bg-primary-100 text-primary-700' : 'bg-neutral-50 text-neutral-500'}`}>{lvl} ({counts[lvl]})</button>))}</div><div className="max-h-80 space-y-1 overflow-auto">{filtered.map((log) => (<div key={log.id} className="flex items-start gap-2 rounded-lg border border-neutral-100 p-2 text-xs">{levelIcon(log.level)}<div className="flex-1"><div className="flex items-center gap-2"><span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${getLogLevelColor(log.level)}`}>{log.level}</span><span className="font-medium text-neutral-600">{log.module}</span><span className="ml-auto text-neutral-400">{new Date(log.timestamp).toLocaleTimeString()}</span></div><p className="mt-0.5 text-neutral-600">{log.message}</p></div></div>))}{filtered.length === 0 && <p className="text-sm text-neutral-400">No logs to display.</p>}</div></div>);
}
export const LogsViewer = memo(LogsViewerComponent);
