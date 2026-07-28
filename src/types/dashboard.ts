export type DashboardStatTrend = 'up' | 'down' | 'neutral';
export type DashboardActivityType = 'enrollment' | 'purchase' | 'completion' | 'login' | 'content' | 'user_registered' | 'course_enrolled' | 'assessment_submitted' | 'course_completed' | 'certificate_issued' | 'system_event';
export type DashboardQuickActionVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type DashboardWidgetSize = 'sm' | 'md' | 'lg' | 'xl';
export type DashboardSystemStatusLevel = 'operational' | 'degraded' | 'down' | 'maintenance' | 'outage';

export interface DashboardStat {
  id: string;
  label: string;
  value: number | string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  description?: string | undefined;
  trend: DashboardStatTrend;
  trendPercent: number;
}

export interface DashboardStats {
  totalUsers: DashboardStat;
  activeStudents: DashboardStat;
  totalCourses: DashboardStat;
  completionRate: DashboardStat;
  revenueThisMonth: DashboardStat;
  pendingAssessments: DashboardStat;
  totalBatches?: DashboardStat | undefined;
  publishedBatches?: DashboardStat | undefined;
  subjects?: DashboardStat | undefined;
  chapters?: DashboardStat | undefined;
  classes?: DashboardStat | undefined;
  videos?: DashboardStat | undefined;
  pdfNotes?: DashboardStat | undefined;
  mcqSets?: DashboardStat | undefined;
  questions?: DashboardStat | undefined;
  enrollments?: DashboardStat | undefined;
  purchases?: DashboardStat | undefined;
  revenue?: DashboardStat | undefined;
}

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  description: string;
  timestamp: string;
  userId?: string | undefined;
  actorName?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface DashboardQuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  variant: DashboardQuickActionVariant;
  permission?: string | undefined;
  feature?: string | undefined;
}

export interface DashboardSystemStatus {
  label: string;
  status: DashboardSystemStatusLevel;
  latencyMs?: number | undefined;
}

export interface DashboardSummary {
  totalStudents?: number | undefined;
  activeStudents?: number | undefined;
  totalBatches?: number | undefined;
  totalRevenue?: number | undefined;
  totalEnrollments?: number | undefined;
  totalPurchases?: number | undefined;
  lastRefreshed: string;
  stats?: DashboardStats | undefined;
  recentActivity?: DashboardActivity[] | undefined;
  quickActions?: DashboardQuickAction[] | undefined;
  systemStatus?: DashboardSystemStatus[] | undefined;
}

export interface DashboardCardConfig {
  id: string;
  title: string;
  icon: string;
  color: string;
  size: DashboardWidgetSize;
  visible: boolean;
  order: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: DashboardWidgetSize;
  data: Record<string, unknown>;
  config?: Record<string, unknown> | undefined;
}

export interface DashboardUpcomingModule {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  batchTitle?: string | undefined;
}
