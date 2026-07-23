import type { UserRole, Permission } from '@/types/application';

export const ROLES: Record<string, UserRole> = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  GUEST: 'guest',
} as const;

export const ROLE_HIERARCHY: UserRole[] = ['admin', 'instructor', 'student', 'guest'];

export const PERMISSIONS: Record<string, Permission> = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE: 'manage',
  PUBLISH: 'publish',
  MODERATE: 'moderate',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ['read', 'write', 'delete', 'manage', 'publish', 'moderate'],
  instructor: ['read', 'write', 'publish', 'moderate'],
  student: ['read'],
  guest: ['read'],
};
