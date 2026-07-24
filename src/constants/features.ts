import type { FeatureFlagConfig } from '@/types/authorization';

export const FEATURE_FLAGS: FeatureFlagConfig = {
  courses: {
    key: 'courses',
    label: 'Course Management',
    enabled: true,
    description: 'Enable course creation, enrollment, and content delivery.',
  },
  assessments: {
    key: 'assessments',
    label: 'Assessments & Quizzes',
    enabled: false,
    description: 'Online quizzes, exams, and automated grading.',
  },
  certifications: {
    key: 'certifications',
    label: 'Certifications',
    enabled: false,
    description: 'Issue and verify completion certificates.',
  },
  discussionForum: {
    key: 'discussionForum',
    label: 'Discussion Forum',
    enabled: false,
    description: 'Threaded discussion boards per course.',
  },
  liveSessions: {
    key: 'liveSessions',
    label: 'Live Sessions',
    enabled: false,
    description: 'Scheduled live video sessions and webinars.',
  },
  analytics: {
    key: 'analytics',
    label: 'Analytics Dashboard',
    enabled: true,
    roles: ['admin'],
    description: 'System-wide analytics and reporting for administrators.',
  },
  userManagement: {
    key: 'userManagement',
    label: 'User Management',
    enabled: true,
    roles: ['admin'],
    description: 'Admin tools to manage user accounts and roles.',
  },
};

export const DEFAULT_FEATURE_FLAGS = Object.keys(FEATURE_FLAGS);
