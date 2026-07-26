import { useState, useEffect, useCallback } from 'react';
import type { Batch, BatchPricing } from '@/types/lms';
import type { HierarchyNode, BreadcrumbItem } from '@/services/lms/hierarchyService';
import { batchService } from '@/services/lms/batchService';
import { hierarchyService } from '@/services/lms/hierarchyService';
import { pricingService } from '@/services/lms/pricingService';
import { enrollmentService } from '@/services/lms/enrollmentService';
import { useCurrentUser } from '@/hooks/useProfile';

export interface BatchDetailState {
  batch: Batch | null;
  tree: HierarchyNode | null;
  pricing: BatchPricing | null;
  breadcrumbs: BreadcrumbItem[];
  enrolled: boolean;
  loading: boolean;
  error: string | null;
}

export function useBatchDetails(slug: string | undefined): BatchDetailState & { refresh: () => void } {
  const profile = useCurrentUser();
  const profileId = profile?.id ?? null;
  const [state, setState] = useState<BatchDetailState>({ batch: null, tree: null, pricing: null, breadcrumbs: [], enrolled: false, loading: true, error: null });

  const load = useCallback(() => {
    if (!slug) { setState({ batch: null, tree: null, pricing: null, breadcrumbs: [], enrolled: false, loading: false, error: 'No batch specified' }); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    batchService.getBySlug(slug).then(async (batchResult) => {
      if (batchResult.error || !batchResult.data) { setState({ batch: null, tree: null, pricing: null, breadcrumbs: [], enrolled: false, loading: false, error: batchResult.error ?? 'Batch not found' }); return; }
      const batch = batchResult.data;
      const [treeResult, pricingResult, enrolledResult] = await Promise.all([
        hierarchyService.getBatchTree(batch.id, true),
        pricingService.getByBatchId(batch.id),
        profileId ? enrollmentService.isStudentEnrolled(profileId, batch.id) : Promise.resolve({ enrolled: false, error: null }),
      ]);
      setState({
        batch, tree: treeResult.data, pricing: pricingResult.data,
        breadcrumbs: [{ id: batch.id, type: 'batch', title: batch.title, slug: batch.slug }],
        enrolled: enrolledResult.enrolled, loading: false, error: null,
      });
    }).catch((err: unknown) => {
      setState({ batch: null, tree: null, pricing: null, breadcrumbs: [], enrolled: false, loading: false, error: err instanceof Error ? err.message : 'Failed to load batch' });
    });
  }, [slug, profileId]);

  useEffect(() => { load(); }, [load]);
  return { ...state, refresh: load };
}
