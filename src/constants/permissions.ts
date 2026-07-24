import type { Permission, Role } from '@/types/authorization';

export const PERMISSIONS = {
  PROFILE_READ: 'profile.read',
  PROFILE_UPDATE: 'profile.update',
  DASHBOARD_VIEW: 'dashboard.view',
  ADMIN_ACCESS: 'admin.access',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  COURSES_READ: 'courses.read',
  COURSES_MANAGE: 'courses.manage',
  STORAGE_UPLOAD: 'storage.upload',
  STORAGE_DELETE: 'storage.delete',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const PERMISSION_LIST: Permission[] = Object.values(PERMISSIONS);

export const PERMISSION_GROUPS: Record<string, Permission[]> = {
  profile: [PERMISSIONS.PROFILE_READ, PERMISSIONS.PROFILE_UPDATE],
  dashboard: [PERMISSIONS.DASHBOARD_VIEW],
  admin: [PERMISSIONS.ADMIN_ACCESS],
  users: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE],
  courses: [PERMISSIONS.COURSES_READ, PERMISSIONS.COURSES_MANAGE],
  storage: [PERMISSIONS.STORAGE_UPLOAD, PERMISSIONS.STORAGE_DELETE],
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.COURSES_READ,
    PERMISSIONS.COURSES_MANAGE,
    PERMISSIONS.STORAGE_UPLOAD,
    PERMISSIONS.STORAGE_DELETE,
  ],
  student: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.COURSES_READ,
    PERMISSIONS.STORAGE_UPLOAD,
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  student: 'Student',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Full access to all system features, user management, and course administration.',
  student: 'Access to personal profile, dashboard, and enrolled courses.',
};
