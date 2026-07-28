import { useState, useCallback, useMemo } from 'react';
import { Download, Search } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAdminSettings';
import { SettingsLayout } from './SettingsDashboardPage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import type { Option } from '@/types/common';
import { format } from 'date-fns';

const ACTION_OPTIONS: Option[] = [
  { label: 'All Actions', value: '' }, { label: 'Create', value: 'create' }, { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' }, { label: 'Login', value: 'login' }, { label: 'Export', value: 'export' },
];

export function AuditLogPage() {
  const { logs, loading, error } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (search && !l.adminName.toLowerCase().includes(search.toLowerCase()) && !l.entity.toLowerCase().includes(search.toLowerCase())) return false;
      if (actionFilter && !l.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
      return true;
    });
  }, [logs, search, actionFilter]);

  const handleExport = useCallback(() => {
    const headers = ['Admin', 'Action', 'Entity', 'Timestamp', 'IP', 'Browser'];
    const rows = filtered.map((l) => [l.adminName, l.action, l.entity, l.timestamp, l.ip, l.browser].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <SettingsLayout title="Audit Logs" description="Track admin activities" icon={undefined}
      actions={<Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}><Download className="h-4 w-4" />Export CSV</Button>}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><Input placeholder="Search by admin or entity..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
        <Select options={ACTION_OPTIONS} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="sm:w-40" />
      </div>
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No audit logs found" description="Activity logs will appear here as admins perform actions." icon={<Download className="h-12 w-12" />} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
            <span className="flex-1 text-xs font-medium text-neutral-500">Admin</span>
            <span className="hidden w-24 text-xs font-medium text-neutral-500 sm:block">Action</span>
            <span className="hidden w-32 text-xs font-medium text-neutral-500 lg:block">Entity</span>
            <span className="hidden w-36 text-xs font-medium text-neutral-500 sm:block">Timestamp</span>
            <span className="hidden w-28 text-xs font-medium text-neutral-500 lg:block">IP</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {filtered.map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-900">{l.adminName}</p><p className="truncate text-xs text-neutral-500">{l.browser}</p></div>
                <div className="hidden w-24 sm:block"><Badge variant="primary" className="text-xs capitalize">{l.action}</Badge></div>
                <div className="hidden w-32 text-xs text-neutral-600 lg:block">{l.entity}</div>
                <div className="hidden w-36 text-xs text-neutral-600 sm:block">{format(new Date(l.timestamp), 'MMM d, h:mm a')}</div>
                <div className="hidden w-28 font-mono text-xs text-neutral-500 lg:block">{l.ip}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
