import { useState, useEffect, useCallback } from 'react';
import { subjectService } from '@/services/lms/subjectService';
import { batchService } from '@/services/lms/batchService';
import { chapterService } from '@/services/lms/chapterService';
import type { Subject, Batch, Chapter } from '@/types/lms';

export interface SubjectWithBatch extends Subject {
  batchTitle: string;
  chapterCount: number;
}

export interface ChapterWithSubject extends Chapter {
  subjectTitle: string;
  batchTitle: string;
}

interface UseAdminSubjectsParams {
  search?: string | undefined;
  batchId?: string | undefined;
  status?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export function useAdminSubjects(params: UseAdminSubjectsParams = {}) {
  const [subjects, setSubjects] = useState<SubjectWithBatch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
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
      const batchResult = await batchService.list();
      if (batchResult.error) setBatches([]);
      else setBatches(batchResult.data);

      const listOpts: Record<string, unknown> = {};
      if (params.batchId) listOpts.batchId = params.batchId;
      if (params.search) listOpts.search = params.search;
      listOpts.sort = { column: 'sort_order', direction: 'asc' as const };

      const result = await subjectService.paginate(page, pageSize, listOpts as never);
      let subjectsData: Subject[] = result.data;
      let subjectsTotal = result.total;

      if (params.status && params.status !== 'all') {
        subjectsData = subjectsData.filter((s) => s.status === params.status);
        subjectsTotal = subjectsData.length;
      }

      const batchMap = new Map(batchResult.data.map((b: Batch) => [b.id, b.title]));

      const subjectsWithCounts = await Promise.all(
        subjectsData.map(async (s) => {
          const { data: chapters } = await chapterService.list({ subjectId: s.id });
          return {
            ...s,
            batchTitle: batchMap.get(s.batchId) ?? 'Unknown',
            chapterCount: chapters?.length ?? 0,
          } as SubjectWithBatch;
        }),
      );

      setSubjects(subjectsWithCounts);
      setTotal(subjectsTotal);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.batchId, params.status, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return {
    subjects, batches, loading, error, total, totalPages, page, pageSize,
    setPage, setPageSize, refresh: load,
  };
}

interface UseAdminChaptersParams {
  search?: string | undefined;
  subjectId?: string | undefined;
  batchId?: string | undefined;
  status?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export function useAdminChapters(params: UseAdminChaptersParams = {}) {
  const [chapters, setChapters] = useState<ChapterWithSubject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
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
      const batchResult = await batchService.list();
      setBatches(batchResult.data);

      let subjectList: Subject[] = [];
      if (params.batchId) {
        const { data: subs } = await subjectService.list({ batchId: params.batchId });
        subjectList = subs ?? [];
      } else {
        const { data: subs } = await subjectService.list();
        subjectList = subs ?? [];
      }
      setSubjects(subjectList);

      const listOpts: Record<string, unknown> = {};
      if (params.subjectId) listOpts.subjectId = params.subjectId;
      if (params.search) listOpts.search = params.search;
      listOpts.sort = { column: 'sort_order', direction: 'asc' as const };

      const result = await chapterService.paginate(page, pageSize, listOpts as never);
      let chaptersData: Chapter[] = result.data;
      let chaptersTotal = result.total;

      if (params.status && params.status !== 'all') {
        chaptersData = chaptersData.filter((c) => c.status === params.status);
        chaptersTotal = chaptersData.length;
      }

      const subjectMap = new Map(subjectList.map((s) => [s.id, s]));
      const batchMap = new Map(batchResult.data.map((b: Batch) => [b.id, b.title]));

      const chaptersWithSubjects = chaptersData.map((c) => {
        const subj = subjectMap.get(c.subjectId);
        return {
          ...c,
          subjectTitle: subj?.title ?? 'Unknown',
          batchTitle: subj ? (batchMap.get(subj.batchId) ?? 'Unknown') : 'Unknown',
        } as ChapterWithSubject;
      });

      setChapters(chaptersWithSubjects);
      setTotal(chaptersTotal);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapters');
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.subjectId, params.batchId, params.status, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return {
    chapters, subjects, batches, loading, error, total, totalPages, page, pageSize,
    setPage, setPageSize, refresh: load,
  };
}
