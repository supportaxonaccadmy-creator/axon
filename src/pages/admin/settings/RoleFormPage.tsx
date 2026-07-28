import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAdminRoles } from '@/hooks/useAdminSettings';
import { PERMISSION_GROUPS } from '@/constants/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { PermissionMatrix } from '@/components/admin/settings';
import type { PermissionAction, RoleConfig } from '@/types/settings';

interface RoleFormPageProps { mode: 'create' | 'edit'; }

export function RoleFormPage({ mode }: RoleFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { roles, createRole, updateRole } = useAdminRoles();
  const existingRole = mode === 'edit' ? roles.find((r) => r.id === id) : undefined;
  const [form, setForm] = useState({
    name: existingRole?.name ?? '',
    description: existingRole?.description ?? '',
    level: existingRole?.level ?? 5,
  });
  const [permissions, setPermissions] = useState<Record<string, PermissionAction[]>>(existingRole?.permissions ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback((groupKey: string, action: PermissionAction) => {
    setPermissions((prev) => {
      const current = prev[groupKey] ?? [];
      const has = current.includes(action);
      return { ...prev, [groupKey]: has ? current.filter((a) => a !== action) : [...current, action] };
    });
  }, []);

  const handleToggleGroup = useCallback((groupKey: string, allActions: PermissionAction[], enable: boolean) => {
    setPermissions((prev) => ({ ...prev, [groupKey]: enable ? [...allActions] : [] }));
  }, []);

  const handleToggleAll = useCallback((enable: boolean) => {
    const updated: Record<string, PermissionAction[]> = {};
    PERMISSION_GROUPS.forEach((g) => { updated[g.key] = enable ? [...g.actions] : []; });
    setPermissions(updated);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Role name is required'); return; }
    setSaving(true);
    const role: RoleConfig = {
      id: existingRole?.id ?? `role-${Date.now().toString(36)}`,
      name: form.name.trim(), description: form.description.trim(), level: Number(form.level),
      isSystem: existingRole?.isSystem ?? false, permissions,
    };
    if (mode === 'create') createRole(role);
    else updateRole(role.id, role);
    setSaving(false);
    navigate('/admin/settings/roles');
  }, [form, permissions, mode, existingRole, createRole, updateRole, navigate]);

  const roleForMatrix: RoleConfig = { id: existingRole?.id ?? 'new', name: form.name, description: form.description, level: form.level, isSystem: false, permissions };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/settings/roles')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Role' : 'Edit Role'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Input label="Role Name" placeholder="e.g. Content Manager" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" placeholder="What can this role do?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          <Input label="Level (0=highest, 10=lowest)" type="number" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: Number(e.target.value) }))} />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <PermissionMatrix role={roleForMatrix} onToggle={handleToggle} onToggleGroup={handleToggleGroup} onToggleAll={handleToggleAll} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/settings/roles')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Role' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
