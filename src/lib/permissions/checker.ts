import type { Permission, Role, PermissionCheck } from '@/types/authorization';
import { ROLE_PERMISSIONS } from '@/constants/permissions';

export function getRolePermissions(role: Role | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

export const checkPermission: PermissionCheck = (role, permission) => {
  if (!role) return false;
  const perms = getRolePermissions(role);
  return perms.includes(permission);
};

export function hasAnyPermission(role: Role | null, permissions: Permission[]): boolean {
  if (!role || permissions.length === 0) return false;
  const perms = getRolePermissions(role);
  return permissions.some((p) => perms.includes(p));
}

export function hasAllPermissions(role: Role | null, permissions: Permission[]): boolean {
  if (!role || permissions.length === 0) return false;
  const perms = getRolePermissions(role);
  return permissions.every((p) => perms.includes(p));
}

export function hasRole(role: Role | null, requiredRole: Role): boolean {
  return role === requiredRole;
}

export function isAdmin(role: Role | null): boolean {
  return role === 'admin';
}

export function isStudent(role: Role | null): boolean {
  return role === 'student';
}

export function hasAnyRole(role: Role | null, roles: Role[]): boolean {
  if (!role || roles.length === 0) return false;
  return roles.includes(role);
}
