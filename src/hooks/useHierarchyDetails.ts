import { useState, useEffect, useCallback } from 'react';
import type { HierarchyNode, BreadcrumbItem } from '@/services/lms/hierarchyService';
import { hierarchyService } from '@/services/lms/hierarchyService';
import { batchService } from '@/services/lms/batchService';
import { subjectService } from '@/services/lms/subjectService';
import { chapterService } from '@/services/lms/chapterService';
import type { Batch, Subject, Chapter } from '@/types/lms';

export interface HierarchyDetailState {
  parent: HierarchyNode | null;
  batch: Batch | null;
  subject: Subject | null;
  chapter: Chapter | null;
  breadcrumbs: BreadcrumbItem[];
  loading: boolean;
  error: string | null;
}

export function useSubjectDetails(slug: string | undefined): HierarchyDetailState & { refresh: () => void } {
  const [state, setState] = useState<HierarchyDetailState>({ parent: null, batch: null, subject: null, chapter: null, breadcrumbs: [], loading: true, error: null });
  const load = useCallback(() => {
    if (!slug) { setState({ parent: null, batch: null, subject: null, chapter: null, breadcrumbs: [], loading: false, error: 'No subject specified' }); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    subjectService.list({ publishedOnly: true, search: undefined }).then(async (subjectsResult) => {
      const subject = (subjectsResult.data ?? []).find((s) => s.slug === slug);
      if (!subject) { setState({ parent: null, batch: null, subject: null, chapter: null, breadcrumbs: [], loading: false, error: 'Subject not found' }); return; }
      const [treeResult, batchResult, breadcrumbResult] = await Promise.all([
        hierarchyService.getSubjectTree(subject.id, true),
        batchService.getById(subject.batchId),
        hierarchyService.buildBreadcrumb('subject', subject.id),
      ]);
      setState({ parent: treeResult.data, batch: batchResult.data, subject, chapter: null, breadcrumbs: breadcrumbResult.data ?? [], loading: false, error: null });
    }).catch((err: unknown) => {
      setState({ parent: null, batch: null, subject: null, chapter: null, breadcrumbs: [], loading: false, error: err instanceof Error ? err.message : 'Failed to load subject' });
    });
  }, [slug]);
  useEffect(() => { load(); }, [load]);
  return { ...state, refresh: load };
}

export function useChapterDetails(slug: string | undefined): HierarchyDetailState & { refresh: () => void } {
  const [state, setState] = useState<HierarchyDetailState>({ parent: null, batch: null, subject: null, chapter: null, breadcrumbs: [], loading: true, error: null });
  const load = useCallback(() => {
    if (!slug) { setState({ parent: null, batch: null, subject: null, chapter: null, breadcrumbs: [], loading: false, error: 'No chapter specified' }); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    chapterService.list({ publishedOnly: true }).then(async (chaptersResult) => {
      const chapter = (chaptersResult.data ?? []).find((c) => c.slug === slug);
      if (!chapter) { setState({ parent: null, batch: null, subject: null, chapter: null, breadcrumbs: [], loading: false, error: 'Chapter not found' }); return; }
      const [treeResult, subjectResult, breadcrumbResult] = await Promise.all([
        hierarchyService.getChapterTree(chapter.id, true),
        subjectService.getById(chapter.subjectId),
        hierarchyService.buildBreadcrumb('chapter', chapter.id),
      ]);
      const subject = subjectResult.data;
      const batch = subject ? (await batchService.getById(subject.batchId)).data : null;
      setState({ parent: treeResult.data, batch, subject, chapter, breadcrumbs: breadcrumbResult.data ?? [], loading: false, error: null });
    }).catch((err: unknown) => {
      setState({ parent: null, batch: null, subject: null, chapter: null, breadcrumbs: [], loading: false, error: err instanceof Error ? err.message : 'Failed to load chapter' });
    });
  }, [slug]);
  useEffect(() => { load(); }, [load]);
  return { ...state, refresh: load };
}
