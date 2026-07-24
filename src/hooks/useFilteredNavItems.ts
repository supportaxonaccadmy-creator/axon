import { useMemo } from 'react';
import { useAuthorizationContext } from '@/contexts/AuthorizationContext';
import { canAccessFeature } from '@/lib/features';
import type { Permission, Role } from '@/types/authorization';

export interface SecureNavItem {
  label: string;
  href: string;
  icon?: string | undefined;
  permissions?: Permission[] | undefined;
  roles?: Role[] | undefined;
  feature?: string | undefined;
  children?: SecureNavItem[] | undefined;
}

export function useFilteredNavItems<T extends SecureNavItem>(items: T[]): T[] {
  const { role, hasAny, hasAll } = useAuthorizationContext();

  return useMemo(() => {
    return items.filter((item) => {
      if (item.roles && role) {
        if (!item.roles.includes(role)) return false;
      }
      if (item.roles && !role) return false;

      if (item.permissions && item.permissions.length > 0) {
        if (!hasAny(item.permissions)) return false;
      }

      if (item.feature) {
        if (!canAccessFeature(item.feature, role)) return false;
      }

      if (item.children) {
        const filteredChildren = item.children.filter((child) => {
          if (child.roles && role) {
            if (!child.roles.includes(role)) return false;
          }
          if (child.roles && !role) return false;
          if (child.permissions && child.permissions.length > 0) {
            if (!hasAny(child.permissions)) return false;
          }
          if (child.feature) {
            if (!canAccessFeature(child.feature, role)) return false;
          }
          return true;
        });
        (item as SecureNavItem & { children: SecureNavItem[] }).children = filteredChildren;
        if (filteredChildren.length === 0) return false;
      }

      return true;
    });
  }, [items, role, hasAny, hasAll]);
}
