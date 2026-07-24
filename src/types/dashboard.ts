export type DashboardStatTrend = 'up' | 'down' | 'neutral';
export type DashboardActivityType =
  | 'user_registered'
  | 'course_enrolled'
  | 'course_completed'
  | 'assessment_submitted'
  | 'certificate_issued'
  | 'system_event';
export type DashboardQuickActionVariant = 'primary' | 'secondary' | 'outline';
export type DashboardWidgetSize = 'sm' | 'md' | 'lg' | 'full';
export type DashboardSystemStatusLevel = 'operational' | 'degraded' | 'outage';

export interface DashboardStat {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number | undefined;
  trend?: DashboardStatTrend | undefined;
  trendPercent?: number | undefined;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  description?: string | undefined;
}

export interface DashboardStats {
  totalUsers: DashboardStat;
  activeStudents: DashboardStat;
  totalCourses: DashboardStat;
  completionRate: DashboardStat;
  revenueThisMonth: DashboardStat;
  pendingAssessments: DashboardStat;
}

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  actorName: string;
  actorAvatarUrl?: string | undefined;
  description: string;
  timestamp: string;
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
  stats: DashboardStats;
  recentActivity: DashboardActivity[];
  quickActions: DashboardQuickAction[];
  systemStatus: DashboardSystemStatus[];
  lastRefreshed: string;
}

export interface DashboardCardConfig {
  id: string;
  title: string;
  size: DashboardWidgetSize;
  visible: boolean;
  order: number;
}

export interface DashboardWidget {
  id: string;
  type: 'stat' | 'activity' | 'quick-action' | 'chart' | 'status';
  title: string;
  size: DashboardWidgetSize;
  data: unknown;
}

export interface DashboardUpcomingModule {
  id: string;
  label: string;
  icon: string;
  description: string;
  feature?: string | undefined;
  status: 'planned' | 'in-progress' | 'coming-soon';
}
