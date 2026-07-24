import type {
  DashboardStats,
  DashboardActivity,
  DashboardQuickAction,
  DashboardSummary,
  DashboardSystemStatus,
} from '@/types/dashboard';

function mockStat(
  id: string,
  label: string,
  value: number | string,
  icon: string,
  color: 'primary' | 'success' | 'warning' | 'error' | 'accent',
  trendPercent: number,
  description?: string,
) {
  return {
    id,
    label,
    value,
    previousValue: typeof value === 'number' ? Math.round(value * (1 - trendPercent / 100)) : undefined,
    trend: (trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
    trendPercent: Math.abs(trendPercent),
    icon,
    color,
    description,
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    totalUsers: mockStat('total-users', 'Total Users', 1284, 'Users', 'primary', 12, 'All registered accounts'),
    activeStudents: mockStat('active-students', 'Active Students', 847, 'GraduationCap', 'success', 8, 'Enrolled in at least one course'),
    totalCourses: mockStat('total-courses', 'Total Courses', 34, 'BookOpen', 'accent', 5, 'Published and draft courses'),
    completionRate: mockStat('completion-rate', 'Completion Rate', '72%', 'TrendingUp', 'success', 3, 'Average across all courses'),
    revenueThisMonth: mockStat('revenue', 'Revenue (Month)', '₹2,14,500', 'IndianRupee', 'primary', 18, 'Current billing cycle'),
    pendingAssessments: mockStat('pending-assessments', 'Pending Reviews', 23, 'ClipboardList', 'warning', -5, 'Awaiting instructor review'),
  };
}

export async function fetchDashboardActivity(): Promise<DashboardActivity[]> {
  await new Promise((r) => setTimeout(r, 300));
  const now = new Date();
  function minsAgo(m: number) {
    return new Date(now.getTime() - m * 60000).toISOString();
  }
  return [
    { id: '1', type: 'user_registered', actorName: 'Priya Sharma', description: 'New student registered', timestamp: minsAgo(5) },
    { id: '2', type: 'course_enrolled', actorName: 'Rahul Verma', description: 'Enrolled in Advanced Cardiac Nursing', timestamp: minsAgo(12) },
    { id: '3', type: 'assessment_submitted', actorName: 'Anita Desai', description: 'Submitted Pharmacology Quiz', timestamp: minsAgo(28) },
    { id: '4', type: 'course_completed', actorName: 'Sunita Patel', description: 'Completed Pediatric Care Fundamentals', timestamp: minsAgo(45) },
    { id: '5', type: 'certificate_issued', actorName: 'Deepak Nair', description: 'Certificate issued for ICU Protocols', timestamp: minsAgo(67) },
    { id: '6', type: 'user_registered', actorName: 'Meena Rao', description: 'New student registered', timestamp: minsAgo(90) },
    { id: '7', type: 'course_enrolled', actorName: 'Kiran Singh', description: 'Enrolled in Emergency Triage Basics', timestamp: minsAgo(120) },
  ];
}

export async function fetchDashboardQuickActions(): Promise<DashboardQuickAction[]> {
  return [
    { id: 'add-user', label: 'Add User', description: 'Create a new student or admin account', icon: 'UserPlus', href: '/admin/users/new', variant: 'primary', permission: 'users.update' },
    { id: 'create-course', label: 'Create Course', description: 'Build a new nursing course', icon: 'PlusCircle', href: '/admin/courses/new', variant: 'primary', permission: 'courses.manage' },
    { id: 'view-analytics', label: 'View Analytics', description: 'Review platform performance', icon: 'BarChart3', href: '/admin/analytics', variant: 'outline', feature: 'analytics' },
    { id: 'manage-assessments', label: 'Assessments', description: 'Review pending submissions', icon: 'ClipboardList', href: '/admin/assessments', variant: 'outline' },
  ];
}

export async function fetchSystemStatus(): Promise<DashboardSystemStatus[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [
    { label: 'Database', status: 'operational', latencyMs: 12 },
    { label: 'File Storage', status: 'operational', latencyMs: 34 },
    { label: 'Authentication', status: 'operational', latencyMs: 8 },
    { label: 'Email Service', status: 'operational' },
  ];
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [stats, recentActivity, quickActions, systemStatus] = await Promise.all([
    fetchDashboardStats(),
    fetchDashboardActivity(),
    fetchDashboardQuickActions(),
    fetchSystemStatus(),
  ]);
  return { stats, recentActivity, quickActions, systemStatus, lastRefreshed: new Date().toISOString() };
}
