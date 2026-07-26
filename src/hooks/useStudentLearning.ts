import { useState, useEffect, useCallback } from 'react';
import type { StudentContinueLearning, StudentRecentClass, StudentProgress } from '@/types/studentDashboard';
import { studentDashboardService } from '@/services/student';
import { useCurrentUser } from '@/hooks/useProfile';

export interface StudentLearningState {
  continueLearning: StudentContinueLearning[]; recentClasses: StudentRecentClass[]; progress: StudentProgress | null;
  loading: boolean; error: string | null; lastStudyDate: string | null; remainingProgress: number; refresh: () => void;
}

export function useStudentLearning(): StudentLearningState {
  const profile = useCurrentUser();
  const profileId = profile?.id ?? null;
  const [state, setState] = useState<{ continueLearning: StudentContinueLearning[]; recentClasses: StudentRecentClass[]; progress: StudentProgress | null; loading: boolean; error: string | null }>({ continueLearning: [], recentClasses: [], progress: null, loading: true, error: null });

  const load = useCallback(() => {
    if (!profileId) { setState({ continueLearning: [], recentClasses: [], progress: null, loading: false, error: 'Not authenticated' }); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.all([studentDashboardService.getContinueLearning(profileId), studentDashboardService.getRecentClasses(profileId), studentDashboardService.getProgress(profileId)])
      .then(([cl, rc, pg]) => { setState({ continueLearning: cl.data ?? [], recentClasses: rc.data ?? [], progress: pg.data, loading: false, error: cl.error ?? rc.error ?? pg.error }); })
      .catch((err: unknown) => { setState({ continueLearning: [], recentClasses: [], progress: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load' }); });
  }, [profileId]);

  useEffect(() => { load(); }, [load]);
  const lastStudyDate = state.continueLearning.length > 0 ? state.continueLearning[0]!.lastAccessedAt : null;
  const remainingProgress = state.progress ? 100 - state.progress.completionPercent : 100;
  return { ...state, lastStudyDate, remainingProgress, refresh: load };
}
