import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminSettings';
import { useDebounce } from '@/hooks/useDebounce';
import { SettingsLayout } from './SettingsDashboardPage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/admin/settings';
import { format } from 'date-fns';
import type { Option } from '@/types/common';

const STATUS_OPTIONS: Option[] = [{ label: 'All', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }];

export function AdminUserListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const debouncedSearch = useDebounce(searchInput, 300);
  const { users, loading, error, total, totalPages, page, setPage, toggleActive } = useAdminUsers({ search: debouncedSearch || undefined, status });

  return (
    <SettingsLayout title="Admin Users" description="Manage admin accounts and roles" icon={undefined}
      actions={<Button onClick={() => navigate('/admin/settings/admin-users/new')}><Plus className="h-4 w-4" />Add Admin</Button>}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><Input placeholder="Search admins..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10" /></div>
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40" />
      </div>
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <EmptyState title="No admin users found" description="Add your first admin user to get started." icon={<Plus className="h-12 w-12" />} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
            <span className="flex-1 text-xs font-medium text-neutral-500">Admin</span>
            <span className="hidden w-28 text-xs font-medium text-neutral-500 lg:block">Role</span>
            <span className="hidden w-28 text-xs font-medium text-neutral-500 sm:block">Joined</span>
            <span className="w-20 text-xs font-medium text-neutral-500">Status</span>
            <span className="w-24 text-xs font-medium text-neutral-500">Actions</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar fallback={u.fullName ?? 'A'} size="sm" />
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-neutral-900">{u.fullName ?? 'Unknown'}</p><p className="truncate text-xs text-neutral-500">{u.email ?? 'No email'}</p></div>
                </div>
                <div className="hidden w-28 lg:block"><Badge variant="primary" className="text-xs capitalize">{u.role}</Badge></div>
                <div className="hidden w-28 text-xs text-neutral-600 sm:block">{format(new Date(u.createdAt), 'MMM d, yyyy')}</div>
                <div className="w-20"><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></div>
                <div className="flex w-24 items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/settings/admin-users/${u.id}/edit`)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(u.id, u.isActive)}>{u.isActive ? 'Deactivate' : 'Activate'}</Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
              <span className="text-xs text-neutral-500">Page {page} of {totalPages} ({total} total)</span>
              <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>
            </div>
          )}
        </div>
      )}
    </SettingsLayout>
  );
}
