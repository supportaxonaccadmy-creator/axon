import type { PermissionAction, PermissionGroupConfig, RoleConfig } from '@/types/settings';

export const PERMISSION_GROUPS: PermissionGroupConfig[] = [
  { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
  { key: 'students', label: 'Students', actions: ['view', 'create', 'update', 'delete', 'export'] },
  { key: 'batches', label: 'Batches', actions: ['view', 'create', 'update', 'delete', 'publish', 'archive'] },
  { key: 'subjects', label: 'Subjects', actions: ['view', 'create', 'update', 'delete', 'publish', 'archive'] },
  { key: 'chapters', label: 'Chapters', actions: ['view', 'create', 'update', 'delete', 'publish', 'archive'] },
  { key: 'classes', label: 'Classes', actions: ['view', 'create', 'update', 'delete', 'publish', 'archive'] },
  { key: 'videos', label: 'Videos', actions: ['view', 'create', 'update', 'delete', 'publish', 'archive'] },
  { key: 'pdfs', label: 'PDF Notes', actions: ['view', 'create', 'update', 'delete', 'publish', 'archive'] },
  { key: 'attachments', label: 'Attachments', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'mcq', label: 'MCQ', actions: ['view', 'create', 'update', 'delete', 'publish', 'archive'] },
  { key: 'purchases', label: 'Purchases', actions: ['view', 'update', 'export'] },
  { key: 'enrollments', label: 'Enrollments', actions: ['view', 'create', 'update', 'delete', 'export'] },
  { key: 'reports', label: 'Reports', actions: ['view', 'export'] },
  { key: 'settings', label: 'Settings', actions: ['view', 'update'] },
  { key: 'audit', label: 'Audit Logs', actions: ['view', 'export'] },
  { key: 'notifications', label: 'Notifications', actions: ['view', 'create', 'update', 'delete'] },
];

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = ['view', 'create', 'update', 'delete', 'export', 'publish', 'archive'];

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: 'super-admin', name: 'Super Admin', description: 'Full unrestricted access to all system features and settings.',
    level: 0, isSystem: true,
    permissions: Object.fromEntries(PERMISSION_GROUPS.map((g) => [g.key, [...g.actions]])),
  },
  {
    id: 'admin', name: 'Admin', description: 'Full access to content management, students, and reports.',
    level: 1, isSystem: true,
    permissions: Object.fromEntries(PERMISSION_GROUPS.filter((g) => g.key !== 'settings').map((g) => [g.key, [...g.actions]])),
  },
  {
    id: 'manager', name: 'Manager', description: 'Manage batches, enrollments, and view reports.',
    level: 2, isSystem: true,
    permissions: Object.fromEntries(
      PERMISSION_GROUPS.filter((g) => ['dashboard', 'batches', 'enrollments', 'students', 'reports'].includes(g.key))
        .map((g) => [g.key, g.actions.filter((a) => a !== 'delete')])
    ),
  },
  {
    id: 'instructor', name: 'Instructor', description: 'Manage content (videos, PDFs, MCQs) and view student progress.',
    level: 3, isSystem: true,
    permissions: Object.fromEntries(
      PERMISSION_GROUPS.filter((g) => ['dashboard', 'subjects', 'chapters', 'classes', 'videos', 'pdfs', 'attachments', 'mcq', 'students'].includes(g.key))
        .map((g) => [g.key, g.actions.filter((a) => ['view', 'create', 'update'].includes(a))])
    ),
  },
  {
    id: 'support', name: 'Support', description: 'View students, purchases, and enrollments. No edit access.',
    level: 4, isSystem: true,
    permissions: Object.fromEntries(
      PERMISSION_GROUPS.filter((g) => ['dashboard', 'students', 'purchases', 'enrollments'].includes(g.key))
        .map((g) => [g.key, ['view']])
    ),
  },
];

export const SETTINGS_NAV = [
  { key: 'overview', label: 'Settings Overview', href: '/admin/settings', icon: 'Settings' },
  { key: 'roles', label: 'Roles & Permissions', href: '/admin/settings/roles', icon: 'ShieldCheck' },
  { key: 'admin-users', label: 'Admin Users', href: '/admin/settings/admin-users', icon: 'UserCog' },
  { key: 'website', label: 'Website', href: '/admin/settings/website', icon: 'Globe' },
  { key: 'seo', label: 'SEO', href: '/admin/settings/seo', icon: 'Search' },
  { key: 'email', label: 'Email', href: '/admin/settings/email', icon: 'Mail' },
  { key: 'payment', label: 'Payment', href: '/admin/settings/payment', icon: 'CreditCard' },
  { key: 'storage', label: 'Storage', href: '/admin/settings/storage', icon: 'HardDrive' },
  { key: 'notifications', label: 'Notifications', href: '/admin/settings/notifications', icon: 'Bell' },
  { key: 'security', label: 'Security', href: '/admin/settings/security', icon: 'Lock' },
  { key: 'system', label: 'System', href: '/admin/settings/system', icon: 'Server' },
  { key: 'backups', label: 'Backups', href: '/admin/settings/backups', icon: 'DatabaseBackup' },
  { key: 'audit', label: 'Audit Logs', href: '/admin/settings/audit', icon: 'ScrollText' },
  { key: 'health', label: 'System Health', href: '/admin/settings/health', icon: 'Activity' },
] as const;

export const PAYMENT_GATEWAYS = [
  { key: 'razorpay', label: 'Razorpay' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'cash', label: 'Cash' },
  { key: 'bank-transfer', label: 'Bank Transfer' },
];

export const TIMEZONES = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'Asia/Singapore'];
export const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'];
export const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'];
export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
