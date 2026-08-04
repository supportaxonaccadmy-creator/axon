import { memo, type ReactNode, useEffect } from 'react';
import { ShieldX } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { auditSecurity } from '@/services/security';

interface PermissionGuardProps { resource: string; action: 'view' | 'create' | 'edit' | 'delete' | 'manage'; children: ReactNode; fallback?: ReactNode; }

function PermissionGuardComponent({ resource, action, children, fallback }: PermissionGuardProps) {
  const { can } = usePermissions();
  const allowed = can(resource, action);
  useEffect(() => { if (!allowed) void auditSecurity.logPermissionDenied(resource, action); }, [allowed, resource, action]);
  if (!allowed) return <>{fallback ?? (<div className="flex flex-col items-center justify-center p-8 text-center"><ShieldX className="mb-3 h-10 w-10 text-error-400" /><p className="text-sm font-medium text-neutral-600">You don't have permission to access this.</p></div>)}</>;
  return <>{children}</>;
}
export const PermissionGuard = memo(PermissionGuardComponent);
