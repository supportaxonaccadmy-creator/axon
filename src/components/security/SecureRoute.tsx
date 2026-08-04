import { memo, type ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { auditSecurity } from '@/services/security';

interface SecureRouteProps { resource: string; action: 'view' | 'create' | 'edit' | 'delete' | 'manage'; children: ReactNode; }

function SecureRouteComponent({ resource, action, children }: SecureRouteProps) {
  const { can } = usePermissions();
  const allowed = can(resource, action);
  useEffect(() => { if (!allowed) void auditSecurity.logPermissionDenied(resource, action); }, [allowed, resource, action]);
  if (!allowed) return <Navigate to="/access-denied" replace />;
  return <>{children}</>;
}
export const SecureRoute = memo(SecureRouteComponent);
