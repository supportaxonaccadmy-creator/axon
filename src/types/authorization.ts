import type { ProfileRole } from '@/types/profile';

export type Role = ProfileRole;

export type Permission =
  | 'profile.read'
  | 'profile.update'
  | 'dashboard.view'
  | 'admin.access'
  | 'users.read'
  | 'users.update'
  | 'courses.read'
  | 'courses.manage'
  | 'storage.upload'
  | 'storage.delete';

export type PermissionGroup =
  | 'profile'
  | 'dashboard'
  | 'admin'
  | 'users'
  | 'courses'
  | 'storage';

export type PermissionCheck = (role: Role | null, permission: Permission) => boolean;

export interface AuthorizationState {
  role: Role | null;
  permissions: Permission[];
  loading: boolean;
  authorized: boolean;
}

export interface FeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
  description?: string | undefined;
  roles?: Role[] | undefined;
}

export interface FeatureFlagConfig {
  [key: string]: FeatureFlag;
}

export interface RoutePermission {
  path: string;
  permissions?: Permission[] | undefined;
  roles?: Role[] | undefined;
  feature?: string | undefined;
}
