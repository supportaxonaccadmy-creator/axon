import { useState, useEffect, useCallback } from 'react';
import type { DashboardStats, DashboardActivity, DashboardSummary, DashboardQuickAction, DashboardSystemStatus } from '@/types/dashboard';
import {
  fetchDashboardStats,
  fetchDashboardActivity,
  fetchDashboardQuickActions,
  fetchSystemStatus,
  fetchDashboardSummary,
} from '@/services/dashboard';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsyncData<T>(fetcher: () => Promise<T>): AsyncState<T> & { refresh: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' }));
  }, [fetcher]);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}

export function useDashboardStats() {
  return useAsyncData<DashboardStats>(fetchDashboardStats);
}

export function useDashboardActivity() {
  return useAsyncData<DashboardActivity[]>(fetchDashboardActivity);
}

export function useDashboardQuickActions() {
  return useAsyncData<DashboardQuickAction[]>(fetchDashboardQuickActions);
}

export function useDashboardSystemStatus() {
  return useAsyncData<DashboardSystemStatus[]>(fetchSystemStatus);
}

export function useDashboard() {
  return useAsyncData<DashboardSummary>(fetchDashboardSummary);
}
