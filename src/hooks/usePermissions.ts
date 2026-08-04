import { useEffect, useCallback, useMemo } from 'react';
import { permissionService } from '@/services/security';
import { useIsAdmin } from '@/hooks/useProfile';

export function usePermissions() {
  const isAdmin = useIsAdmin();
  const role = isAdmin ? 'admin' : 'student';
  useEffect(() => { permissionService.setRole(role); }, [role]);
  const can = useCallback((resource: string, action: 'view' | 'create' | 'edit' | 'delete' | 'manage') => { permissionService.setRole(role); return permissionService.can(resource, action); }, [role]);
  const canAny = useCallback((resource: string, actions: ('view' | 'create' | 'edit' | 'delete' | 'manage')[]) => { permissionService.setRole(role); return permissionService.canAny(resource, actions); }, [role]);
  const canAll = useCallback((resource: string, actions: ('view' | 'create' | 'edit' | 'delete' | 'manage')[]) => { permissionService.setRole(role); return permissionService.canAll(resource, actions); }, [role]);
  const permissions = useMemo(() => { permissionService.setRole(role); return permissionService.getPermissions(); }, [role]);
  return { can, canAny, canAll, permissions, role };
}
