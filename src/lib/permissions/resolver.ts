import type { Permission, PermissionGroup, Role } from '@/types/authorization';
import { PERMISSION_GROUPS, ROLE_PERMISSIONS } from '@/constants/permissions';

export function resolvePermissionsForRole(role: Role | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

export function resolvePermissionsForGroup(group: PermissionGroup): Permission[] {
  return PERMISSION_GROUPS[group] ?? [];
}

export function resolveGroupsForRole(role: Role | null): PermissionGroup[] {
  const perms = resolvePermissionsForRole(role);
  const groups: PermissionGroup[] = [];
  for (const [group, groupPerms] of Object.entries(PERMISSION_GROUPS)) {
    if (groupPerms.some((p) => perms.includes(p))) {
      groups.push(group as PermissionGroup);
    }
  }
  return groups;
}

export function resolvePermissionLabel(permission: Permission): string {
  const parts = permission.split('.');
  const resource = parts[0] ?? permission;
  const action = parts[1] ?? '';
  return `${resource.charAt(0).toUpperCase() + resource.slice(1)} — ${action}`;
}
