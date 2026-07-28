import { useState, useCallback, useEffect, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { DEFAULT_ROLES, PERMISSION_GROUPS } from '@/constants/settings';
import type { RoleConfig, PermissionAction, AdminUser, AuditLogEntry, BackupRecord } from '@/types/settings';

interface ProfileRow {
  id: string;
  auth_user_id: string;
  uuid: string;
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAdminRoles() {
  const [roles, setRoles] = useState<RoleConfig[]>(DEFAULT_ROLES);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const createRole = useCallback((role: RoleConfig) => {
    setRoles((prev) => [...prev, role]);
  }, []);

  const updateRole = useCallback((id: string, updates: Partial<RoleConfig>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id || r.isSystem));
  }, []);

  const duplicateRole = useCallback((id: string): RoleConfig | null => {
    const role = roles.find((r) => r.id === id);
    if (!role) return null;
    const copy: RoleConfig = {
      ...role, id: `${role.id}-copy-${Date.now().toString(36)}`, name: `${role.name} (Copy)`,
      isSystem: false, permissions: JSON.parse(JSON.stringify(role.permissions)),
    };
    setRoles((prev) => [...prev, copy]);
    return copy;
  }, [roles]);

  const togglePermission = useCallback((roleId: string, groupKey: string, action: PermissionAction) => {
    setRoles((prev) => prev.map((r) => {
      if (r.id !== roleId) return r;
      const current = r.permissions[groupKey] ?? [];
      const has = current.includes(action);
      const updated = has ? current.filter((a) => a !== action) : [...current, action];
      return { ...r, permissions: { ...r.permissions, [groupKey]: updated } };
    }));
  }, []);

  const toggleGroup = useCallback((roleId: string, groupKey: string, allActions: PermissionAction[], enable: boolean) => {
    setRoles((prev) => prev.map((r) => {
      if (r.id !== roleId) return r;
      return { ...r, permissions: { ...r.permissions, [groupKey]: enable ? [...allActions] : [] } };
    }));
  }, []);

  const toggleAll = useCallback((roleId: string, enable: boolean) => {
    setRoles((prev) => prev.map((r) => {
      if (r.id !== roleId) return r;
      const permissions: Record<string, PermissionAction[]> = {};
      PERMISSION_GROUPS.forEach((g) => { permissions[g.key] = enable ? [...g.actions] : []; });
      return { ...r, permissions };
    }));
  }, []);

  return { roles, loading, error, createRole, updateRole, deleteRole, duplicateRole, togglePermission, toggleGroup, toggleAll };
}

interface UseAdminUsersParams {
  search?: string | undefined;
  status?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export function useAdminUsers(params: UseAdminUsersParams = {}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(params.page ?? 1);
  const [pageSize, setPageSize] = useState(params.pageSize ?? 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      let countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'student');
      if (params.search) countQuery = countQuery.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
      if (params.status === 'active') countQuery = countQuery.eq('is_active', true);
      if (params.status === 'inactive') countQuery = countQuery.eq('is_active', false);
      const { count } = await countQuery;
      const totalCount = count ?? 0;

      let query = supabase.from('profiles').select('*').neq('role', 'student');
      if (params.search) query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
      if (params.status === 'active') query = query.eq('is_active', true);
      if (params.status === 'inactive') query = query.eq('is_active', false);
      query = query.order('created_at', { ascending: false });
      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);
      const { data, error: queryError } = await query;
      if (queryError) throw new Error(queryError.message);

      setUsers((data as ProfileRow[] ?? []).map((row) => ({
        id: row.id, authUserId: row.auth_user_id, uuid: row.uuid, fullName: row.full_name, email: row.email,
        mobile: row.mobile, avatarUrl: row.avatar_url, role: row.role, isActive: row.is_active,
        createdAt: row.created_at, updatedAt: row.updated_at,
      })));
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / pageSize) || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.status, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    const supabase = getSupabaseClient();
    await supabase.from('profiles').update({ is_active: !isActive }).eq('id', id);
    load();
  }, [load]);

  const updateRole = useCallback(async (id: string, role: string) => {
    const supabase = getSupabaseClient();
    await supabase.from('profiles').update({ role }).eq('id', id);
    load();
  }, [load]);

  return { users, loading, error, total, totalPages, page, setPage, setPageSize, refresh: load, toggleActive, updateRole };
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error: err } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (err) throw new Error(err.message);
      setLogs((data ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id ?? ''), adminName: String(row.admin_name ?? 'System'), action: String(row.action ?? ''),
        entity: String(row.entity ?? ''), timestamp: String(row.created_at ?? ''), ip: String(row.ip_address ?? '—'),
        browser: String(row.browser ?? '—'),
      })));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { logs, loading, error, refresh: load };
}

export function useBackups() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setBackups([
      { id: '1', filename: 'backup-2026-07-28.sql', size: '24.5 MB', createdAt: '2026-07-28T10:00:00Z', status: 'completed' },
      { id: '2', filename: 'backup-2026-07-27.sql', size: '23.8 MB', createdAt: '2026-07-27T10:00:00Z', status: 'completed' },
    ]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createBackup = useCallback(() => {
    const newBackup: BackupRecord = {
      id: Date.now().toString(), filename: `backup-${new Date().toISOString().slice(0, 10)}.sql`,
      size: '0 MB', createdAt: new Date().toISOString(), status: 'in-progress',
    };
    setBackups((prev) => [newBackup, ...prev]);
  }, []);

  const deleteBackup = useCallback((id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { backups, loading, createBackup, deleteBackup, refresh: load };
}

export function useSystemHealth() {
  const [health, setHealth] = useState({
    supabaseStatus: 'operational', storageUsage: '2.4 GB / 10 GB', databaseStatus: 'operational',
    environment: 'production', version: '4B.4.0', memoryUsage: '128 MB / 512 MB', lastBackup: '2026-07-28T10:00:00Z',
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const start = Date.now();
      await supabase.from('batches').select('id', { count: 'exact', head: true }).limit(1);
      const latency = Date.now() - start;
      setHealth((prev) => ({
        ...prev, supabaseStatus: latency < 1000 ? 'operational' : 'degraded',
        databaseStatus: latency < 1000 ? 'operational' : 'degraded',
      }));
    } catch {
      setHealth((prev) => ({ ...prev, supabaseStatus: 'down', databaseStatus: 'down' }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return useMemo(() => ({ health, loading, refresh: load }), [health, loading, load]);
}
