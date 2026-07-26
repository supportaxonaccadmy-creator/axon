import { useState, useEffect, useCallback } from 'react';
import type { StudentDashboardSummary } from '@/types/studentDashboard';
import { studentDashboardService } from '@/services/student';
import { useCurrentUser } from '@/hooks/useProfile';

interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }

function useStudentDashboardData(): AsyncState<StudentDashboardSummary> & { refresh: () => void } {
  const profile = useCurrentUser();
  const profileId = profile?.id ?? null;
  const [state, setState] = useState<AsyncState<StudentDashboardSummary>>({ data: null, loading: true, error: null });
  const load = useCallback(() => {
    if (!profileId) { setState({ data: null, loading: false, error: 'Not authenticated' }); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    studentDashboardService.getDashboard(profileId)
      .then((result) => {
        if (result.error) setState({ data: null, loading: false, error: result.error });
        else setState({ data: result.data, loading: false, error: null });
      })
      .catch((err: unknown) => setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' }));
  }, [profileId]);
  useEffect(() => { load(); }, [load]);
  return { ...state, refresh: load };
}

export function useStudentDashboard() { return useStudentDashboardData(); }
