import type { SecureNavItem } from '@/hooks/useFilteredNavItems';

export const STUDENT_NAV_ITEMS: SecureNavItem[] = [
  { label: 'Dashboard', href: '/student', icon: 'LayoutDashboard', roles: ['student'] },
  { label: 'My Batches', href: '/student/batches', icon: 'Layers', roles: ['student'] },
  { label: 'Continue Learning', href: '/student/continue', icon: 'PlayCircle', roles: ['student'] },
  { label: 'Live Classes', href: '/student/live-classes', icon: 'Radio', roles: ['student'] },
  { label: 'PDF Notes', href: '/student/pdf-notes', icon: 'FileText', roles: ['student'] },
  { label: 'MCQ Practice', href: '/student/mcq-practice', icon: 'HelpCircle', roles: ['student'] },
  { label: 'Progress', href: '/student/progress', icon: 'TrendingUp', roles: ['student'] },
  { label: 'Announcements', href: '/student/announcements', icon: 'Megaphone', roles: ['student'] },
  { label: 'Profile', href: '/student/profile', icon: 'User', roles: ['student'] },
  { label: 'Settings', href: '/student/settings', icon: 'Settings', roles: ['student'] },
];

export const STUDENT_NAV_ACTIVE_PATHS = ['/student'] as const;
