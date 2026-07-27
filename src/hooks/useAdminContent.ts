import { useState, useEffect, useCallback } from 'react';
import { classService } from '@/services/lms/classService';
import { videoService } from '@/services/lms/videoService';
import { pdfService } from '@/services/lms/pdfService';
import { attachmentService } from '@/services/lms/attachmentService';
import { chapterService } from '@/services/lms/chapterService';
import { subjectService } from '@/services/lms/subjectService';
import type { Class, Video, PdfNote, Attachment, Chapter, Subject, LmsStatus } from '@/types/lms';

export interface ClassWithRelations extends Class {
  chapterTitle: string;
  subjectTitle: string;
  videoCount: number;
  pdfCount: number;
  attachmentCount: number;
}

export interface VideoWithClass extends Video {
  classTitle: string;
  chapterTitle: string;
}

export interface PdfWithClass extends PdfNote {
  classTitle: string;
}

export interface AttachmentWithClass extends Attachment {
  classTitle: string;
}

interface AdminContentParams {
  search?: string | undefined;
  status?: string | undefined;
  classId?: string | undefined;
  chapterId?: string | undefined;
  subjectId?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

function useContentList<T, R extends { chapterId?: string | undefined; classId?: string | undefined }>(
  service: { paginate: (p: number, ps: number, opts?: Record<string, unknown>) => Promise<{ data: T[]; total: number; totalPages: number }> },
  enrich: (items: T[], chapters: Chapter[], subjects: Subject[], classes: Class[]) => Promise<R[]>,
  params: AdminContentParams,
) {
  const [items, setItems] = useState<R[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
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
      const [chapResult, subjResult, clsResult] = await Promise.all([
        chapterService.list(),
        subjectService.list(),
        classService.list(),
      ]);
      const chapterList = chapResult.data ?? [];
      const subjectList = subjResult.data ?? [];
      const classList = clsResult.data ?? [];
      setChapters(chapterList);
      setSubjects(subjectList);
      setClasses(classList);

      const opts: Record<string, unknown> = {};
      if (params.search) opts.search = params.search;
      if (params.classId) opts.classId = params.classId;
      if (params.chapterId) opts.chapterId = params.chapterId;
      opts.sort = { column: 'sort_order', direction: 'asc' as const };

      const result = await service.paginate(page, pageSize, opts);
      let data = result.data;

      if (params.status && params.status !== 'all') {
        data = data.filter((item) => {
          const status = (item as unknown as { status: LmsStatus }).status;
          return status === params.status;
        });
      }

      const enriched = await enrich(data, chapterList, subjectList, classList);
      setItems(enriched);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.status, params.classId, params.chapterId, params.subjectId, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return { items, chapters, subjects, classes, loading, error, total, totalPages, page, pageSize, setPage, setPageSize, refresh: load };
}

export function useAdminClasses(params: AdminContentParams = {}) {
  return useContentList<Class, ClassWithRelations>(
    classService as unknown as { paginate: (p: number, ps: number, opts?: Record<string, unknown>) => Promise<{ data: Class[]; total: number; totalPages: number }> },
    async (items, chapters, subjects, _classes) => {
      const chapterMap = new Map(chapters.map((c) => [c.id, c]));
      const subjectMap = new Map(subjects.map((s) => [s.id, s]));
      const classIds = items.map((c) => c.id);
      const [videos, pdfs, attachments] = await Promise.all([
        Promise.all(classIds.map((id) => videoService.list({ classId: id }))),
        Promise.all(classIds.map((id) => pdfService.list({ classId: id }))),
        Promise.all(classIds.map((id) => attachmentService.list({ classId: id }))),
      ]);
      return items.map((c, i) => {
        const ch = chapterMap.get(c.chapterId);
        const subj = ch ? subjectMap.get(ch.subjectId) : undefined;
        return {
          ...c,
          chapterTitle: ch?.title ?? 'Unknown',
          subjectTitle: subj?.title ?? 'Unknown',
          videoCount: videos[i]?.data?.length ?? 0,
          pdfCount: pdfs[i]?.data?.length ?? 0,
          attachmentCount: attachments[i]?.data?.length ?? 0,
        };
      });
    },
    params,
  );
}

export function useAdminVideos(params: AdminContentParams = {}) {
  return useContentList<Video, VideoWithClass>(
    videoService as unknown as { paginate: (p: number, ps: number, opts?: Record<string, unknown>) => Promise<{ data: Video[]; total: number; totalPages: number }> },
    async (items, chapters, _subjects, classes) => {
      const classMap = new Map(classes.map((c) => [c.id, c]));
      const chapterMap = new Map(chapters.map((c) => [c.id, c]));
      return items.map((v) => {
        const cls = classMap.get(v.classId);
        const ch = cls ? chapterMap.get(cls.chapterId) : undefined;
        return {
          ...v,
          classTitle: cls?.title ?? 'Unknown',
          chapterTitle: ch?.title ?? 'Unknown',
        };
      });
    },
    params,
  );
}

export function useAdminPdfNotes(params: AdminContentParams = {}) {
  return useContentList<PdfNote, PdfWithClass>(
    pdfService as unknown as { paginate: (p: number, ps: number, opts?: Record<string, unknown>) => Promise<{ data: PdfNote[]; total: number; totalPages: number }> },
    async (items, _chapters, _subjects, classes) => {
      const classMap = new Map(classes.map((c) => [c.id, c]));
      return items.map((p) => ({
        ...p,
        classTitle: classMap.get(p.classId)?.title ?? 'Unknown',
      }));
    },
    params,
  );
}

export function useAdminAttachments(params: AdminContentParams = {}) {
  return useContentList<Attachment, AttachmentWithClass>(
    attachmentService as unknown as { paginate: (p: number, ps: number, opts?: Record<string, unknown>) => Promise<{ data: Attachment[]; total: number; totalPages: number }> },
    async (items, _chapters, _subjects, classes) => {
      const classMap = new Map(classes.map((c) => [c.id, c]));
      return items.map((a) => ({
        ...a,
        classTitle: classMap.get(a.classId)?.title ?? 'Unknown',
      }));
    },
    params,
  );
}

export type { LmsStatus };
