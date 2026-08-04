import { memo, useState, useEffect, useCallback } from 'react';
import { ScrollText, Filter } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { auditSecurity } from '@/services/security';
import type { SecurityAuditEntry } from '@/services/security';

function AuditSecurityPageComponent() {
  const [logs, setLogs] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const loadLogs = useCallback(async () => { const data = await auditSecurity.getAuditLogs(100); setLogs(data); setLoading(false); }, []);
  useEffect(() => { void loadLogs(); }, [loadLogs]);
  const filteredLogs = filter ? logs.filter((l) => l.eventType.includes(filter.toLowerCase()) || l.action?.includes(filter.toLowerCase())) : logs;
  const getSeverityColor = (severity: string): string => { if (severity === 'critical') return 'bg-error-50 text-error-700'; if (severity === 'warning') return 'bg-warning-50 text-warning-700'; return 'bg-neutral-50 text-neutral-600'; };
  return (
    <PageContainer>
      <SectionHeader title="Security Audit Log" description="Review all security-related events" />
      <div className="mb-4 flex items-center gap-2"><Filter className="h-4 w-4 text-neutral-400" /><input type="text" placeholder="Filter by event type or action..." value={filter} onChange={(e) => setFilter(e.target.value)} className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" aria-label="Filter audit logs" /></div>
      {loading ? (<p className="text-sm text-neutral-400">Loading audit logs...</p>) : filteredLogs.length === 0 ? (<div className="flex h-40 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400"><div className="text-center"><ScrollText className="mx-auto mb-2 h-8 w-8" /><p className="text-sm">No security events found.</p></div></div>) : (<div className="space-y-2">{filteredLogs.map((log) => (<div key={log.id} className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><span className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${getSeverityColor(log.severity)}`}>{log.severity}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium text-neutral-900">{log.eventType.replace(/_/g, ' ')}</p><p className="text-xs text-neutral-500">{log.action ?? 'N/A'} | {log.resourceType ?? 'N/A'} | {log.resourceId ?? 'N/A'}</p>{log.createdAt && (<p className="mt-1 text-xs text-neutral-400">{new Date(log.createdAt).toLocaleString()}</p>)}</div></div>))}</div>)}
    </PageContainer>
  );
}
export const AuditSecurityPage = memo(AuditSecurityPageComponent);
