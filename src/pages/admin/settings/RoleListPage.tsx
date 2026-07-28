import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, Edit, Trash2 } from 'lucide-react';
import { useAdminRoles } from '@/hooks/useAdminSettings';
import { SettingsLayout } from './SettingsDashboardPage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/admin/common';
import { PERMISSION_GROUPS } from '@/constants/settings';
import type { RoleConfig } from '@/types/settings';

export function RoleListPage() {
  const navigate = useNavigate();
  const { roles, duplicateRole, deleteRole } = useAdminRoles();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getPermissionCount = useCallback((role: RoleConfig) => {
    return Object.values(role.permissions).reduce((sum, actions) => sum + actions.length, 0);
  }, []);

  const handleDelete = useCallback(() => {
    if (confirmDelete) deleteRole(confirmDelete);
    setConfirmDelete(null);
  }, [confirmDelete, deleteRole]);

  return (
    <SettingsLayout title="Roles & Permissions" description="Manage roles and their permissions" icon={undefined}
      actions={<Button onClick={() => navigate('/admin/settings/roles/new')}><Plus className="h-4 w-4" />New Role</Button>}>
      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-neutral-900">{role.name}</p>
                {role.isSystem && <Badge variant="default" className="text-[10px]">System</Badge>}
              </div>
              <p className="mt-0.5 truncate text-xs text-neutral-500">{role.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {PERMISSION_GROUPS.map((g) => {
                  const actions = role.permissions[g.key] ?? [];
                  if (actions.length === 0) return null;
                  return <Badge key={g.key} variant="primary" className="text-[10px]">{g.label} ({actions.length})</Badge>;
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">{getPermissionCount(role)} permissions</span>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/settings/roles/${role.id}/edit`)}><Edit className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => duplicateRole(role.id)}><Copy className="h-3.5 w-3.5" /></Button>
              {!role.isSystem && <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(role.id)}><Trash2 className="h-3.5 w-3.5 text-error-600" /></Button>}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Role" message="Are you sure you want to delete this role?" confirmLabel="Delete" loading={false} />
    </SettingsLayout>
  );
}
