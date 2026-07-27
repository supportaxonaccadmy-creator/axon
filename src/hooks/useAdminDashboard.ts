import { useState, useEffect, useCallback } from 'react';
import { adminDashboardService } from '@/services/dashboard/adminDashboardService';
import type { DashboardOverview, RevenueDataPoint, EnrollmentDataPoint, ContentDistributionData } from '@/types/adminDashboard';

export interface AdminDashboardState {
  overview: DashboardOverview | null;
  revenueTrend: RevenueDataPoint[];
  enrollmentTrend: EnrollmentDataPoint[];
  contentDistribution: ContentDistributionData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAdminDashboard(): AdminDashboardState {
  const [state, setState] = useState<{ overview: DashboardOverview | null; revenueTrend: RevenueDataPoint[]; enrollmentTrend: EnrollmentDataPoint[]; contentDistribution: ContentDistributionData[]; loading: boolean; error: string | null }>({ overview: null, revenueTrend: [], enrollmentTrend: [], contentDistribution: [], loading: true, error: null });
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.all([adminDashboardService.getDashboardOverview(), adminDashboardService.getRevenueAnalytics(), adminDashboardService.getEnrollmentAnalytics(), adminDashboardService.getContentAnalytics()])
      .then(([overview, revenue, enrollment, content]) => {
        setState({ overview: overview.data, revenueTrend: revenue.data?.trend ?? [], enrollmentTrend: enrollment.data?.trend ?? [], contentDistribution: content.data ?? [], loading: false, error: overview.error ?? revenue.error ?? enrollment.error ?? content.error });
      })
      .catch((err: unknown) => { setState({ overview: null, revenueTrend: [], enrollmentTrend: [], contentDistribution: [], loading: false, error: err instanceof Error ? err.message : 'Failed to load' }); });
  }, []);
  useEffect(() => { load(); }, [load]);
  return { ...state, refresh: load };
}
