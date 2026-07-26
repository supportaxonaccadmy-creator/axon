import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Batch, Subject, Chapter, Class } from '@/types/lms';
import type { BatchRow, SubjectRow, ChapterRow, ClassRow } from '@/types/lms';
import { batchService } from './batchService';
import { subjectService } from './subjectService';
import { chapterService } from './chapterService';
import { classService } from './classService';

export interface HierarchyNode {
  id: string;
  type: 'batch' | 'subject' | 'chapter' | 'class';
  parentId: string | null;
  title: string;
  slug: string;
  status: string;
  sortOrder: number;
  children: HierarchyNode[];
}

export interface BreadcrumbItem {
  id: string;
  type: 'batch' | 'subject' | 'chapter' | 'class';
  title: string;
  slug: string;
}

function mapBatch(row: BatchRow): Batch {
  return {
    id: row.id, title: row.title, slug: row.slug, description: row.description,
    thumbnail: row.thumbnail, banner: row.banner, icon: row.icon,
    price: Number(row.price), discountPrice: row.discount_price !== null ? Number(row.discount_price) : null,
    isFree: row.is_free, isPublished: row.is_published, sortOrder: row.sort_order,
    status: row.status, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapSubject(row: SubjectRow): Subject {
  return {
    id: row.id, batchId: row.batch_id, title: row.title, slug: row.slug,
    description: row.description, icon: row.icon, sortOrder: row.sort_order,
    status: row.status, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapChapter(row: ChapterRow): Chapter {
  return {
    id: row.id, subjectId: row.subject_id, title: row.title, slug: row.slug,
    description: row.description, sortOrder: row.sort_order, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapClass(row: ClassRow): Class {
  return {
    id: row.id, chapterId: row.chapter_id, title: row.title, slug: row.slug,
    description: row.description, thumbnail: row.thumbnail, duration: row.duration,
    sortOrder: row.sort_order, isPreview: row.is_preview, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export const hierarchyService = {
  async getBatchTree(batchId: string, publishedOnly: boolean = false): Promise<{ data: HierarchyNode | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data: batchRow, error: batchError } = await supabase.from('batches').select('*').eq('id', batchId).maybeSingle();
    if (batchError || !batchRow) {
      const err = batchError?.message ?? 'Batch not found';
      logger.error('hierarchyService.getBatchTree', { error: err });
      return { data: null, error: err };
    }
    const batch = mapBatch(batchRow as BatchRow);

    const { data: subjectRows } = await supabase.from('subjects').select('*').eq('batch_id', batchId);
    const subjects = (subjectRows as SubjectRow[] ?? []).map(mapSubject).filter((s) => !publishedOnly || s.status === 'published');

    const subjectIds = subjects.map((s) => s.id);
    let chapters: Chapter[] = [];
    let classes: Class[] = [];
    if (subjectIds.length > 0) {
      const { data: chapterRows } = await supabase.from('chapters').select('*').in('subject_id', subjectIds);
      chapters = (chapterRows as ChapterRow[] ?? []).map(mapChapter).filter((c) => !publishedOnly || c.status === 'published');
      const chapterIds = chapters.map((c) => c.id);
      if (chapterIds.length > 0) {
        const { data: classRows } = await supabase.from('classes').select('*').in('chapter_id', chapterIds);
        classes = (classRows as ClassRow[] ?? []).map(mapClass).filter((c) => !publishedOnly || c.status === 'published');
      }
    }

    const tree: HierarchyNode = {
      id: batch.id, type: 'batch', parentId: null, title: batch.title, slug: batch.slug,
      status: batch.status, sortOrder: batch.sortOrder,
      children: subjects.map((s) => ({
        id: s.id, type: 'subject' as const, parentId: batch.id, title: s.title, slug: s.slug,
        status: s.status, sortOrder: s.sortOrder,
        children: chapters.filter((c) => c.subjectId === s.id).map((ch) => ({
          id: ch.id, type: 'chapter' as const, parentId: s.id, title: ch.title, slug: ch.slug,
          status: ch.status, sortOrder: ch.sortOrder,
          children: classes.filter((cl) => cl.chapterId === ch.id).map((cls) => ({
            id: cls.id, type: 'class' as const, parentId: ch.id, title: cls.title, slug: cls.slug,
            status: cls.status, sortOrder: cls.sortOrder, children: [],
          })),
        })),
      })),
    };
    return { data: tree, error: null };
  },

  async getSubjectTree(subjectId: string, publishedOnly: boolean = false): Promise<{ data: HierarchyNode | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data: subjectRow, error: subjectError } = await supabase.from('subjects').select('*').eq('id', subjectId).maybeSingle();
    if (subjectError || !subjectRow) {
      const err = subjectError?.message ?? 'Subject not found';
      return { data: null, error: err };
    }
    const subject = mapSubject(subjectRow as SubjectRow);

    const { data: chapterRows } = await supabase.from('chapters').select('*').eq('subject_id', subjectId);
    let chapters = (chapterRows as ChapterRow[] ?? []).map(mapChapter);
    if (publishedOnly) chapters = chapters.filter((c) => c.status === 'published');

    const chapterIds = chapters.map((c) => c.id);
    let classes: Class[] = [];
    if (chapterIds.length > 0) {
      const { data: classRows } = await supabase.from('classes').select('*').in('chapter_id', chapterIds);
      classes = (classRows as ClassRow[] ?? []).map(mapClass);
      if (publishedOnly) classes = classes.filter((c) => c.status === 'published');
    }

    const tree: HierarchyNode = {
      id: subject.id, type: 'subject', parentId: subject.batchId, title: subject.title, slug: subject.slug,
      status: subject.status, sortOrder: subject.sortOrder,
      children: chapters.map((ch) => ({
        id: ch.id, type: 'chapter' as const, parentId: subject.id, title: ch.title, slug: ch.slug,
        status: ch.status, sortOrder: ch.sortOrder,
        children: classes.filter((cl) => cl.chapterId === ch.id).map((cls) => ({
          id: cls.id, type: 'class' as const, parentId: ch.id, title: cls.title, slug: cls.slug,
          status: cls.status, sortOrder: cls.sortOrder, children: [],
        })),
      })),
    };
    return { data: tree, error: null };
  },

  async getChapterTree(chapterId: string, publishedOnly: boolean = false): Promise<{ data: HierarchyNode | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data: chapterRow, error: chapterError } = await supabase.from('chapters').select('*').eq('id', chapterId).maybeSingle();
    if (chapterError || !chapterRow) {
      const err = chapterError?.message ?? 'Chapter not found';
      return { data: null, error: err };
    }
    const chapter = mapChapter(chapterRow as ChapterRow);

    const { data: classRows } = await supabase.from('classes').select('*').eq('chapter_id', chapterId);
    let classes = (classRows as ClassRow[] ?? []).map(mapClass);
    if (publishedOnly) classes = classes.filter((c) => c.status === 'published');

    const tree: HierarchyNode = {
      id: chapter.id, type: 'chapter', parentId: chapter.subjectId, title: chapter.title, slug: chapter.slug,
      status: chapter.status, sortOrder: chapter.sortOrder,
      children: classes.map((cls) => ({
        id: cls.id, type: 'class' as const, parentId: chapter.id, title: cls.title, slug: cls.slug,
        status: cls.status, sortOrder: cls.sortOrder, children: [],
      })),
    };
    return { data: tree, error: null };
  },

  async getFullHierarchy(publishedOnly: boolean = false): Promise<{ data: HierarchyNode[]; error: string | null }> {
    const { data: batches, error: batchError } = await batchService.list({ publishedOnly });
    if (batchError) return { data: [], error: batchError };
    const { data: subjects, error: subjectError } = await subjectService.list({ publishedOnly });
    if (subjectError) return { data: [], error: subjectError };
    const { data: chapters, error: chapterError } = await chapterService.list({ publishedOnly });
    if (chapterError) return { data: [], error: chapterError };
    const { data: classes, error: classError } = await classService.list({ publishedOnly });
    if (classError) return { data: [], error: classError };

    const tree: HierarchyNode[] = batches.map((batch) => ({
      id: batch.id, type: 'batch' as const, parentId: null, title: batch.title, slug: batch.slug,
      status: batch.status, sortOrder: batch.sortOrder,
      children: subjects.filter((s) => s.batchId === batch.id).map((subject) => ({
        id: subject.id, type: 'subject' as const, parentId: batch.id, title: subject.title, slug: subject.slug,
        status: subject.status, sortOrder: subject.sortOrder,
        children: chapters.filter((c) => c.subjectId === subject.id).map((chapter) => ({
          id: chapter.id, type: 'chapter' as const, parentId: subject.id, title: chapter.title, slug: chapter.slug,
          status: chapter.status, sortOrder: chapter.sortOrder,
          children: classes.filter((cl) => cl.chapterId === chapter.id).map((cls) => ({
            id: cls.id, type: 'class' as const, parentId: chapter.id, title: cls.title, slug: cls.slug,
            status: cls.status, sortOrder: cls.sortOrder, children: [],
          })),
        })),
      })),
    }));
    return { data: tree, error: null };
  },

  flattenHierarchy(nodes: HierarchyNode[]): HierarchyNode[] {
    const result: HierarchyNode[] = [];
    const walk = (node: HierarchyNode): void => {
      result.push(node);
      for (const child of node.children) { walk(child); }
    };
    for (const node of nodes) walk(node);
    return result;
  },

  async buildBreadcrumb(type: 'batch' | 'subject' | 'chapter' | 'class', id: string): Promise<{ data: BreadcrumbItem[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const breadcrumbs: BreadcrumbItem[] = [];

    if (type === 'batch') {
      const { data: row } = await supabase.from('batches').select('id, title, slug').eq('id', id).maybeSingle();
      if (row) breadcrumbs.push({ id: row.id, type: 'batch', title: row.title, slug: row.slug });
    } else if (type === 'subject') {
      const { data: subject } = await supabase.from('subjects').select('id, title, slug, batch_id').eq('id', id).maybeSingle();
      if (!subject) return { data: [], error: 'Subject not found' };
      const { data: batch } = await supabase.from('batches').select('id, title, slug').eq('id', subject.batch_id).maybeSingle();
      if (batch) breadcrumbs.push({ id: batch.id, type: 'batch', title: batch.title, slug: batch.slug });
      breadcrumbs.push({ id: subject.id, type: 'subject', title: subject.title, slug: subject.slug });
    } else if (type === 'chapter') {
      const { data: chapter } = await supabase.from('chapters').select('id, title, slug, subject_id').eq('id', id).maybeSingle();
      if (!chapter) return { data: [], error: 'Chapter not found' };
      const { data: subject } = await supabase.from('subjects').select('id, title, slug, batch_id').eq('id', chapter.subject_id).maybeSingle();
      if (!subject) return { data: [], error: 'Subject not found' };
      const { data: batch } = await supabase.from('batches').select('id, title, slug').eq('id', subject.batch_id).maybeSingle();
      if (batch) breadcrumbs.push({ id: batch.id, type: 'batch', title: batch.title, slug: batch.slug });
      breadcrumbs.push({ id: subject.id, type: 'subject', title: subject.title, slug: subject.slug });
      breadcrumbs.push({ id: chapter.id, type: 'chapter', title: chapter.title, slug: chapter.slug });
    } else if (type === 'class') {
      const { data: cls } = await supabase.from('classes').select('id, title, slug, chapter_id').eq('id', id).maybeSingle();
      if (!cls) return { data: [], error: 'Class not found' };
      const { data: chapter } = await supabase.from('chapters').select('id, title, slug, subject_id').eq('id', cls.chapter_id).maybeSingle();
      if (!chapter) return { data: [], error: 'Chapter not found' };
      const { data: subject } = await supabase.from('subjects').select('id, title, slug, batch_id').eq('id', chapter.subject_id).maybeSingle();
      if (!subject) return { data: [], error: 'Subject not found' };
      const { data: batch } = await supabase.from('batches').select('id, title, slug').eq('id', subject.batch_id).maybeSingle();
      if (batch) breadcrumbs.push({ id: batch.id, type: 'batch', title: batch.title, slug: batch.slug });
      breadcrumbs.push({ id: subject.id, type: 'subject', title: subject.title, slug: subject.slug });
      breadcrumbs.push({ id: chapter.id, type: 'chapter', title: chapter.title, slug: chapter.slug });
      breadcrumbs.push({ id: cls.id, type: 'class', title: cls.title, slug: cls.slug });
    }
    return { data: breadcrumbs, error: null };
  },

  async getParents(type: 'subject' | 'chapter' | 'class', id: string): Promise<{ data: BreadcrumbItem[]; error: string | null }> {
    const result = await this.buildBreadcrumb(type, id);
    if (result.error) return result;
    return { data: result.data.slice(0, -1), error: null };
  },

  async getChildren(type: 'batch' | 'subject' | 'chapter', id: string, publishedOnly: boolean = false): Promise<{ data: HierarchyNode[]; error: string | null }> {
    if (type === 'batch') {
      const result = await this.getBatchTree(id, publishedOnly);
      return { data: result.data?.children ?? [], error: result.error };
    }
    if (type === 'subject') {
      const result = await this.getSubjectTree(id, publishedOnly);
      return { data: result.data?.children ?? [], error: result.error };
    }
    const result = await this.getChapterTree(id, publishedOnly);
    return { data: result.data?.children ?? [], error: result.error };
  },
};
