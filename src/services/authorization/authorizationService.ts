import type { Permission, Role, RoutePermission } from '@/types/authorization';
import {
  checkPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasAnyRole,
  getRolePermissions,
} from '@/lib/permissions';
import { canAccessFeature } from '@/lib/features';

export function hasPermission(role: Role | null, permission: Permission): boolean {
  return checkPermission(role, permission);
}

export function hasAny(role: Role | null, permissions: Permission[]): boolean {
  return hasAnyPermission(role, permissions);
}

export function hasAll(role: Role | null, permissions: Permission[]): boolean {
  return hasAllPermissions(role, permissions);
}

export function canAccessRoute(role: Role | null, route: RoutePermission): boolean {
  if (!role) return false;

  if (route.roles && route.roles.length > 0) {
    if (!hasAnyRole(role, route.roles)) return false;
  }

  if (route.permissions && route.permissions.length > 0) {
    if (!hasAnyPermission(role, route.permissions)) return false;
  }

  if (route.feature) {
    if (!canAccessFeature(route.feature, role)) return false;
  }

  return true;
}

export function canAccessFeatureByKey(role: Role | null, featureKey: string): boolean {
  return canAccessFeature(featureKey, role);
}

export function getPermissions(role: Role | null): Permission[] {
  return getRolePermissions(role);
}
