import { useMemo, type ReactNode } from 'react';
import { AuthorizationContext, type AuthorizationContextValue } from '@/contexts/AuthorizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { resolvePermissionsForRole, checkPermission, hasAnyPermission, hasAllPermissions, hasAnyRole } from '@/lib/permissions';
import { canAccessFeature as checkFeature } from '@/lib/features';
import type { Permission, Role } from '@/types/authorization';

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const role: Role | null = useMemo(() => {
    if (profile?.role) return profile.role;
    const authRole = user?.role;
    if (authRole === 'admin' || authRole === 'student') return authRole;
    return null;
  }, [profile?.role, user?.role]);

  const permissions = useMemo(() => resolvePermissionsForRole(role), [role]);

  const loading = authLoading || profileLoading;
  const authorized = !!user && !!role;

  const value: AuthorizationContextValue = useMemo(() => ({
    role,
    permissions,
    loading,
    authorized,
    hasPermission: (permission: Permission) => checkPermission(role, permission),
    hasAny: (perms: Permission[]) => hasAnyPermission(role, perms),
    hasAll: (perms: Permission[]) => hasAllPermissions(role, perms),
    hasRole: (r: Role) => hasAnyRole(role, [r]),
    canAccessFeature: (featureKey: string) => checkFeature(featureKey, role),
  }), [role, permissions, loading, authorized]);

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>;
}
