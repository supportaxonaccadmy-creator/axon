import { memo, useState, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

const RESOURCES = ['dashboard', 'batches', 'subjects', 'chapters', 'classes', 'videos', 'pdfs', 'attachments', 'mcq', 'students', 'enrollments', 'purchases', 'reports', 'settings', 'storage', 'notifications', 'announcements', 'live', 'analytics', 'security', 'performance', 'cache'];
const ACTIONS = ['view', 'create', 'edit', 'delete', 'manage'] as const;

function PermissionTableComponent() {
  const { permissions, role } = usePermissions();
  const [filter, setFilter] = useState('');
  const filteredResources = useMemo(() => { if (!filter) return RESOURCES; return RESOURCES.filter((r) => r.includes(filter.toLowerCase())); }, [filter]);
  const hasPermission = (resource: string, action: typeof ACTIONS[number]): boolean => { const allowed = permissions[resource]; if (!allowed) return false; return allowed.includes(action) || allowed.includes('manage' as never); };
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold text-neutral-900">Permission Matrix ({role})</h3><input type="text" placeholder="Filter resources..." value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:border-primary-500 focus:outline-none" aria-label="Filter permissions" /></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-neutral-200"><th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Resource</th>{ACTIONS.map((action) => (<th key={action} className="px-3 py-2 text-center text-xs font-semibold capitalize text-neutral-500">{action}</th>))}</tr></thead><tbody>{filteredResources.map((resource) => (<tr key={resource} className="border-b border-neutral-100 last:border-0"><td className="px-3 py-2 text-xs font-medium text-neutral-700">{resource}</td>{ACTIONS.map((action) => (<td key={action} className="px-3 py-2 text-center">{hasPermission(resource, action) ? (<span className="inline-block h-2 w-2 rounded-full bg-success-500" aria-label="Allowed" />) : (<span className="inline-block h-2 w-2 rounded-full bg-neutral-300" aria-label="Not allowed" />)}</td>))}</tr>))}</tbody></table></div>
    </div>
  );
}
export const PermissionTable = memo(PermissionTableComponent);
