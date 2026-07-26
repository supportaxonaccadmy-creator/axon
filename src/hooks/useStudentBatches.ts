import { useState, useEffect, useCallback } from 'react';
import type { Batch } from '@/types/lms';
import type { Enrollment } from '@/types/lms';
import { batchService } from '@/services/lms/batchService';
import { enrollmentService } from '@/services/lms/enrollmentService';
import { useCurrentUser } from '@/hooks/useProfile';

export interface StudentBatchList {
  purchased: Batch[];
  free: Batch[];
  locked: Batch[];
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useStudentBatches(search?: string): StudentBatchList {
  const profile = useCurrentUser();
  const profileId = profile?.id ?? null;
  const [state, setState] = useState<{ purchased: Batch[]; free: Batch[]; locked: Batch[]; enrollments: Enrollment[]; loading: boolean; error: string | null }>({
    purchased: [], free: [], locked: [], enrollments: [], loading: true, error: null,
  });

  const load = useCallback(() => {
    if (!profileId) { setState({ purchased: [], free: [], locked: [], enrollments: [], loading: false, error: 'Not authenticated' }); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.all([
      batchService.list({ publishedOnly: true, search }),
      enrollmentService.getAccessibleBatches(profileId),
    ]).then(([batchResult, enrollResult]) => {
      if (batchResult.error) { setState({ purchased: [], free: [], locked: [], enrollments: [], loading: false, error: batchResult.error }); return; }
      const allBatches = batchResult.data;
      const enrollments = enrollResult.data ?? [];
      const enrolledBatchIds = new Set(enrollments.map((e) => e.batchId));
      const purchased = allBatches.filter((b) => enrolledBatchIds.has(b.id));
      const free = allBatches.filter((b) => b.isFree && !enrolledBatchIds.has(b.id));
      const locked = allBatches.filter((b) => !b.isFree && !enrolledBatchIds.has(b.id));
      setState({ purchased, free, locked, enrollments, loading: false, error: null });
    }).catch((err: unknown) => {
      setState({ purchased: [], free: [], locked: [], enrollments: [], loading: false, error: err instanceof Error ? err.message : 'Failed to load batches' });
    });
  }, [profileId, search]);

  useEffect(() => { load(); }, [load]);
  return { ...state, refresh: load };
}
