export { PERMISSIONS, PERMISSION_LIST, PERMISSION_GROUPS, ROLE_PERMISSIONS, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/constants/permissions';
export type { PermissionKey } from '@/constants/permissions';
export {
  getRolePermissions,
  checkPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  isAdmin,
  isStudent,
  hasAnyRole,
} from './checker';
export {
  resolvePermissionsForRole,
  resolvePermissionsForGroup,
  resolveGroupsForRole,
  resolvePermissionLabel,
} from './resolver';
