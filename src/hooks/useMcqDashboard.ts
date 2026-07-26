import { useState, useEffect, useCallback } from 'react';
import type { McqDashboardStats } from '@/types/mcqPractice';
import { mcqPracticeService } from '@/services/student/mcqPracticeService';
import { useCurrentUser } from '@/hooks/useProfile';

export function useMcqDashboard() {
  const profile = useCurrentUser();
  const profileId = profile?.id ?? null;
  const [state, setState] = useState<{ data: McqDashboardStats | null; loading: boolean; error: string | null }>({
    data: null, loading: true, error: null,
  });

  const load = useCallback(() => {
    if (!profileId) { setState({ data: null, loading: false, error: 'Not authenticated' }); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    mcqPracticeService.getDashboardStats(profileId).then((result) => {
      if (result.error) setState({ data: null, loading: false, error: result.error });
      else setState({ data: result.data, loading: false, error: null });
    }).catch((err: unknown) => {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    });
  }, [profileId]);

  useEffect(() => { load(); }, [load]);
  return { ...state, refresh: load };
}
