import { useAuthorizationContext } from '@/contexts/AuthorizationContext';
import type { Permission, Role } from '@/types/authorization';

export function useAuthorization() {
  return useAuthorizationContext();
}

export function usePermissions() {
  const { permissions } = useAuthorizationContext();
  return permissions;
}

export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = useAuthorizationContext();
  return hasPermission(permission);
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { hasAny } = useAuthorizationContext();
  return hasAny(permissions);
}

export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { hasAll } = useAuthorizationContext();
  return hasAll(permissions);
}

export function useRole(): Role | null {
  const { role } = useAuthorizationContext();
  return role;
}

export function useIsAdminRole(): boolean {
  const { role } = useAuthorizationContext();
  return role === 'admin';
}

export function useIsStudentRole(): boolean {
  const { role } = useAuthorizationContext();
  return role === 'student';
}

export function useCanAccessFeature(featureKey: string): boolean {
  const { canAccessFeature } = useAuthorizationContext();
  return canAccessFeature(featureKey);
}
