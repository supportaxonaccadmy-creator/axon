import type { PermissionCheck } from './security.types';

type Permission = 'view' | 'create' | 'edit' | 'delete' | 'manage';
type Resource = string;

const ADMIN_PERMISSIONS: Record<Resource, Permission[]> = {
  dashboard: ['view', 'manage'],
  batches: ['view', 'create', 'edit', 'delete', 'manage'],
  subjects: ['view', 'create', 'edit', 'delete', 'manage'],
  chapters: ['view', 'create', 'edit', 'delete', 'manage'],
  classes: ['view', 'create', 'edit', 'delete', 'manage'],
  videos: ['view', 'create', 'edit', 'delete', 'manage'],
  pdfs: ['view', 'create', 'edit', 'delete', 'manage'],
  attachments: ['view', 'create', 'edit', 'delete', 'manage'],
  mcq: ['view', 'create', 'edit', 'delete', 'manage'],
  students: ['view', 'create', 'edit', 'delete', 'manage'],
  enrollments: ['view', 'edit', 'manage'],
  purchases: ['view', 'manage'],
  reports: ['view', 'manage'],
  settings: ['view', 'manage'],
  storage: ['view', 'create', 'edit', 'delete', 'manage'],
  notifications: ['view', 'create', 'edit', 'delete', 'manage'],
  announcements: ['view', 'create', 'edit', 'delete', 'manage'],
  live: ['view', 'create', 'edit', 'delete', 'manage'],
  analytics: ['view', 'manage'],
  security: ['view', 'manage'],
  performance: ['view', 'manage'],
  cache: ['view', 'manage'],
};

const STUDENT_PERMISSIONS: Record<Resource, Permission[]> = {
  dashboard: ['view'],
  batches: ['view'],
  subjects: ['view'],
  chapters: ['view'],
  classes: ['view'],
  videos: ['view'],
  pdfs: ['view'],
  mcq: ['view'],
  enrollments: ['view'],
  purchases: ['view'],
  notifications: ['view'],
  announcements: ['view'],
  live: ['view'],
  analytics: ['view'],
  profile: ['view', 'edit'],
  offline: ['view'],
};

class PermissionService {
  private permissions: Record<Resource, Permission[]> = {};

  setRole(role: string): void {
    this.permissions = role === 'admin' ? ADMIN_PERMISSIONS : STUDENT_PERMISSIONS;
  }
  can(resource: Resource, action: Permission): boolean {
    const allowed = this.permissions[resource];
    if (!allowed) return false;
    return allowed.includes(action) || allowed.includes('manage');
  }

  canAny(resource: Resource, actions: Permission[]): boolean {
    return actions.some((a) => this.can(resource, a));
  }

  canAll(resource: Resource, actions: Permission[]): boolean {
    return actions.every((a) => this.can(resource, a));
  }

  check(resource: Resource, action: Permission): PermissionCheck {
    return { resource, action, allowed: this.can(resource, action) };
  }

  getPermissions(): Record<Resource, Permission[]> {
    return { ...this.permissions };
  }

  isSuperAdmin(userId: string, superAdminIds: string[]): boolean {
    return superAdminIds.includes(userId);
  }

  getResourceList(): string[] {
    return Object.keys(this.permissions);
  }
}

export const permissionService = new PermissionService();
