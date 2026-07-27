import type {
  DashboardStats,
  DashboardQuickAction,
  DashboardSystemStatus,
} from '@/types/dashboard';

export interface DashboardOverview {
  stats: DashboardStats;
  contentStats: DashboardContentStat[];
  revenue: DashboardRevenueSummary;
  enrollment: DashboardEnrollmentSummary;
  systemStatus: DashboardSystemStatus[];
  recentStudents: RecentStudent[];
  recentPurchases: RecentPurchase[];
  quickActions: DashboardQuickAction[];
  lastRefreshed: string;
}

export interface DashboardContentStat {
  id: string;
  label: string;
  value: number;
  published: number;
  draft: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'accent';
}

export interface DashboardRevenueSummary {
  totalRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  thisMonth: number;
  trend: 'up' | 'down' | 'neutral';
  trendPercent: number;
}

export interface DashboardEnrollmentSummary {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  thisMonth: number;
  trend: 'up' | 'down' | 'neutral';
  trendPercent: number;
}

export interface RecentStudent {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  registeredAt: string;
  role: string;
}

export interface RecentPurchase {
  id: string;
  studentName: string;
  batchTitle: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  purchasedAt: string;
}

export interface RevenueDataPoint {
  label: string;
  value: number;
}

export interface EnrollmentDataPoint {
  label: string;
  value: number;
}

export interface ContentDistributionData {
  label: string;
  value: number;
  color: string;
}
