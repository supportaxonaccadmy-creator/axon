import { memo, useState, useEffect, useCallback } from 'react';
import { ScrollText, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { auditSecurity } from '@/services/security';
import type { SecurityAuditEntry } from '@/services/security';

function AuditLogCardComponent() {
  const [logs, setLogs] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const loadLogs = useCallback(async () => { const data = await auditSecurity.getAuditLogs(20); setLogs(data); setLoading(false); }, []);
  useEffect(() => { void loadLogs(); }, [loadLogs]);
  const getIcon = (severity: string) => { if (severity === 'critical') return ShieldAlert; if (severity === 'warning') return AlertTriangle; return Info; };
  const getIconColor = (severity: string) => { if (severity === 'critical') return 'text-error-500'; if (severity === 'warning') return 'text-warning-500'; return 'text-neutral-400'; };
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><ScrollText className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Security Audit Log</h3></div>
      {loading ? (<p className="text-sm text-neutral-400">Loading audit logs...</p>) : logs.length === 0 ? (<p className="text-sm text-neutral-400">No security events recorded.</p>) : (<div className="max-h-80 space-y-2 overflow-y-auto">{logs.map((log) => { const Icon = getIcon(log.severity); return (<div key={log.id} className="flex items-start gap-3 rounded-lg bg-neutral-50 px-3 py-2"><Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${getIconColor(log.severity)}`} /><div className="min-w-0 flex-1"><p className="text-xs font-medium text-neutral-700">{log.eventType.replace(/_/g, ' ')}</p><p className="truncate text-xs text-neutral-400">{log.action ?? 'N/A'} | {log.resourceType ?? 'N/A'}{log.createdAt && ` | ${new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}</p></div></div>); })}</div>)}
    </div>
  );
}
export const AuditLogCard = memo(AuditLogCardComponent);
