import { useState, useEffect, useCallback } from 'react';
import { batchService } from '@/services/lms/batchService';
import { pricingService } from '@/services/lms/pricingService';
import { enrollmentService } from '@/services/lms/enrollmentService';
import { purchaseService } from '@/services/lms/purchaseService';
import { subjectService } from '@/services/lms/subjectService';
import { classService } from '@/services/lms/classService';
import { statisticsService, type BatchStatistics } from '@/services/lms/statisticsService';
import type { Batch, BatchPricing, Enrollment, Purchase, Subject, Class, LmsStatus } from '@/types/lms';

export interface BatchWithStats extends Batch {
  pricing: BatchPricing | null;
  enrollmentCount: number;
  purchaseCount: number;
  revenue: number;
  subjectCount: number;
  classCount: number;
}

interface UseAdminBatchesParams {
  search?: string | undefined;
  status?: string | undefined;
  pricingType?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export function useAdminBatches(params: UseAdminBatchesParams = {}) {
  const [batches, setBatches] = useState<BatchWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(params.page ?? 1);
  const [pageSize, setPageSize] = useState(params.pageSize ?? 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listOpts: Record<string, unknown> = {};
      if (params.search) listOpts.search = params.search;
      listOpts.sort = { column: 'sort_order', direction: 'asc' as const };

      const result = await batchService.paginate(page, pageSize, listOpts as never);
      let batchesData: Batch[] = result.data;

      if (params.status && params.status !== 'all') {
        batchesData = batchesData.filter((b) => b.status === params.status);
      }

      const batchesWithStats = await Promise.all(
        batchesData.map(async (b): Promise<BatchWithStats | null> => {
          const [pricingResult, enrollResult, purchaseResult, subjectResult, statsResult] = await Promise.all([
            pricingService.getByBatchId(b.id),
            enrollmentService.list({ batchId: b.id }),
            purchaseService.list({ batchId: b.id }),
            subjectService.list({ batchId: b.id }),
            statisticsService.getBatchStatistics(b.id),
          ]);
          const purchases = purchaseResult.data ?? [];
          const completedPurchases = purchases.filter((p) => p.paymentStatus === 'completed');
          const revenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0);

          let classCount = statsResult.data?.classCount ?? 0;
          if (classCount === 0 && subjectResult.data && subjectResult.data.length > 0) {
            const subjectIds = subjectResult.data.map((s) => s.id);
            const { data: chapters } = await import('@/services/lms/chapterService').then((m) => m.chapterService.list({}));
            const chapterIds = (chapters ?? []).filter((c) => subjectIds.includes(c.subjectId)).map((c) => c.id);
            if (chapterIds.length > 0) {
              const { data: classes } = await classService.list({});
              classCount = (classes ?? []).filter((cls) => chapterIds.includes(cls.chapterId)).length;
            }
          }

          if (params.pricingType === 'free' && !b.isFree) return null;
          if (params.pricingType === 'paid' && b.isFree) return null;

          return {
            ...b,
            pricing: pricingResult.data,
            enrollmentCount: enrollResult.data?.length ?? 0,
            purchaseCount: completedPurchases.length,
            revenue,
            subjectCount: subjectResult.data?.length ?? 0,
            classCount,
          };
        }),
      );

      const filtered = batchesWithStats.filter((b): b is BatchWithStats => b !== null);
      setBatches(filtered);
      setTotal(filtered.length);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batches');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.status, params.pricingType, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return { batches, loading, error, total, totalPages, page, pageSize, setPage, setPageSize, refresh: load };
}

export interface BatchDetailData {
  batch: Batch | null;
  pricing: BatchPricing | null;
  enrollments: Enrollment[];
  purchases: Purchase[];
  subjects: Subject[];
  classes: Class[];
  stats: BatchStatistics | null;
  loading: boolean;
  error: string | null;
}

export function useBatchDetails(batchId: string | undefined): BatchDetailData & { refresh: () => void } {
  const [state, setState] = useState<BatchDetailData>({
    batch: null, pricing: null, enrollments: [], purchases: [], subjects: [], classes: [], stats: null, loading: true, error: null,
  });

  const load = useCallback(async () => {
    if (!batchId) { setState((s) => ({ ...s, loading: false, error: 'No batch specified' })); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [batchResult, pricingResult, enrollResult, purchaseResult, subjectResult, statsResult] = await Promise.all([
        batchService.getById(batchId),
        pricingService.getByBatchId(batchId),
        enrollmentService.list({ batchId }),
        purchaseService.list({ batchId }),
        subjectService.list({ batchId }),
        statisticsService.getBatchStatistics(batchId),
      ]);
      if (batchResult.error || !batchResult.data) {
        setState({ batch: null, pricing: null, enrollments: [], purchases: [], subjects: [], classes: [], stats: null, loading: false, error: batchResult.error ?? 'Batch not found' });
        return;
      }
      let classes: Class[] = [];
      const subjects = subjectResult.data ?? [];
      if (subjects.length > 0) {
        const { data: allClasses } = await classService.list({});
        classes = allClasses ?? [];
      }
      setState({
        batch: batchResult.data,
        pricing: pricingResult.data,
        enrollments: enrollResult.data ?? [],
        purchases: purchaseResult.data ?? [],
        subjects,
        classes,
        stats: statsResult.data,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({ batch: null, pricing: null, enrollments: [], purchases: [], subjects: [], classes: [], stats: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load batch' });
    }
  }, [batchId]);

  useEffect(() => { load(); }, [load]);
  return { ...state, refresh: load };
}

export interface BatchPricingState {
  pricing: BatchPricing | null;
  loading: boolean;
  error: string | null;
  update: (input: Partial<BatchPricing>) => Promise<{ error: string | null }>;
  refresh: () => void;
}

export function useBatchPricing(batchId: string | undefined): BatchPricingState {
  const [pricing, setPricing] = useState<BatchPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!batchId) { setLoading(false); setError('No batch specified'); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await pricingService.getByBatchId(batchId);
    setPricing(data);
    setError(err);
    setLoading(false);
  }, [batchId]);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (input: Partial<BatchPricing>) => {
    if (!pricing) return { error: 'No pricing record to update' };
    const { data, error: err } = await pricingService.update(pricing.id, input);
    if (err) return { error: err };
    if (data) setPricing(data);
    return { error: null };
  }, [pricing]);

  return { pricing, loading, error, update, refresh: load };
}

export type { LmsStatus };
