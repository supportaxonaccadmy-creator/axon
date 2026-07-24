import { createContext, useContext } from 'react';
import type { Permission, Role } from '@/types/authorization';

export interface AuthorizationContextValue {
  role: Role | null;
  permissions: Permission[];
  loading: boolean;
  authorized: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAny: (permissions: Permission[]) => boolean;
  hasAll: (permissions: Permission[]) => boolean;
  hasRole: (role: Role) => boolean;
  canAccessFeature: (featureKey: string) => boolean;
}

export const AuthorizationContext = createContext<AuthorizationContextValue | null>(null);

export function useAuthorizationContext(): AuthorizationContextValue {
  const ctx = useContext(AuthorizationContext);
  if (!ctx) {
    throw new Error('useAuthorizationContext must be used within an AuthorizationProvider');
  }
  return ctx;
}
