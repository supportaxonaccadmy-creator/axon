import type { ReactNode } from 'react';
import { useAuthorizationContext } from '@/contexts/AuthorizationContext';
import type { Permission, Role } from '@/types/authorization';
import { AccessDeniedCard } from '@/components/authorization/AccessDeniedCard';

export interface PermissionGateProps {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean | undefined;
  fallback?: ReactNode | undefined;
}

export function PermissionGate({
  children,
  permissions,
  requireAll = false,
  fallback,
}: PermissionGateProps) {
  const { hasAny, hasAll } = useAuthorizationContext();
  const allowed = requireAll ? hasAll(permissions) : hasAny(permissions);

  if (!allowed) {
    return <>{fallback ?? null}</>;
  }
  return <>{children}</>;
}

export interface RoleGateProps {
  children: ReactNode;
  roles: Role[];
  fallback?: ReactNode | undefined;
}

export function RoleGate({ children, roles, fallback }: RoleGateProps) {
  const { role } = useAuthorizationContext();
  if (!role || !roles.includes(role)) {
    return <>{fallback ?? null}</>;
  }
  return <>{children}</>;
}

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode | undefined }) {
  const { role } = useAuthorizationContext();
  if (role !== 'admin') return <>{fallback ?? null}</>;
  return <>{children}</>;
}

export function StudentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode | undefined }) {
  const { role } = useAuthorizationContext();
  if (role !== 'student') return <>{fallback ?? null}</>;
  return <>{children}</>;
}

export function UnauthorizedMessage({ message }: { message?: string | undefined }) {
  return (
    <AccessDeniedCard
      title="Unauthorized"
      message={message ?? 'You do not have permission to view this content.'}
    />
  );
}
