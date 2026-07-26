import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';
import { calculateScore, sortByScore } from '@/lib/search/searchRanking';
import { highlightField, extractSnippet } from '@/lib/search/searchHighlight';

export interface EnhancedSearchResultItem {
  id: string;
  type: 'batch' | 'subject' | 'chapter' | 'class' | 'video' | 'pdf' | 'mcq';
  title: string;
  slug: string;
  description: string | null;
  status: string;
  parentId: string | null;
  score: number;
  highlightedTitle: string;
  highlightedDescription: string;
  snippet: string;
}

export interface EnhancedSearchOptions {
  types?: ('batch' | 'subject' | 'chapter' | 'class' | 'video' | 'pdf' | 'mcq')[] | undefined;
  publishedOnly?: boolean | undefined;
  adminMode?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  highlight?: boolean | undefined;
  minScore?: number | undefined;
  batchId?: string | undefined;
  subjectId?: string | undefined;
  chapterId?: string | undefined;
  classId?: string | undefined;
}

const TABLE_MAP: Record<string, { table: string; type: EnhancedSearchResultItem['type']; parentColumn: string | null }> = {
  batch: { table: 'batches', type: 'batch', parentColumn: null },
  subject: { table: 'subjects', type: 'subject', parentColumn: 'batch_id' },
  chapter: { table: 'chapters', type: 'chapter', parentColumn: 'subject_id' },
  class: { table: 'classes', type: 'class', parentColumn: 'chapter_id' },
  video: { table: 'videos', type: 'video', parentColumn: 'class_id' },
  pdf: { table: 'pdf_notes', type: 'pdf', parentColumn: 'class_id' },
  mcq: { table: 'mcq_sets', type: 'mcq', parentColumn: 'class_id' },
};

const SEARCH_COLUMNS = 'id, title, slug, description, status';

export const enhancedSearchService = {
  async search(query: string, options?: EnhancedSearchOptions): Promise<{ data: EnhancedSearchResultItem[]; error: string | null }> {
    if (!query || query.trim().length === 0) return { data: [], error: null };
    const terms = query.trim().toLowerCase().split(/\s+/).filter((t) => t.length > 0);
    const types = options?.types ?? ['batch', 'subject', 'chapter', 'class', 'video', 'pdf', 'mcq'];
    const supabase = getSupabaseClient();
    const rawResults: { id: string; type: EnhancedSearchResultItem['type']; title: string; slug: string; description: string | null; status: string; parentId: string | null }[] = [];

    for (const typeKey of types) {
      const mapping = TABLE_MAP[typeKey];
      if (!mapping) continue;
      let q = supabase.from(mapping.table).select(SEARCH_COLUMNS + (mapping.parentColumn ? `, ${mapping.parentColumn}` : '')).ilike('title', `%${query}%`);

      if (!options?.adminMode && options?.publishedOnly) {
        q = q.eq('status', 'published');
      }

      if (mapping.parentColumn && options?.batchId && typeKey === 'subject') {
        q = q.eq(mapping.parentColumn, options.batchId);
      }
      if (mapping.parentColumn && options?.subjectId && typeKey === 'chapter') {
        q = q.eq(mapping.parentColumn, options.subjectId);
      }
      if (mapping.parentColumn && options?.chapterId && typeKey === 'class') {
        q = q.eq(mapping.parentColumn, options.chapterId);
      }
      if (mapping.parentColumn && options?.classId && ['video', 'pdf', 'mcq'].includes(typeKey)) {
        q = q.eq(mapping.parentColumn, options.classId);
      }

      q = q.limit(50);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (q as any);
      if (error) { logger.error(`enhancedSearchService.search.${typeKey}`, { error: (error as { message: string }).message }); continue; }
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        rawResults.push({
          id: String(row.id),
          type: mapping.type,
          title: String(row.title ?? ''),
          slug: String(row.slug ?? ''),
          description: row.description !== null && row.description !== undefined ? String(row.description) : null,
          status: String(row.status ?? ''),
          parentId: mapping.parentColumn ? (row[mapping.parentColumn] ? String(row[mapping.parentColumn]) : null) : null,
        });
      }
    }

    const scored = rawResults.map((item) => {
      const score = calculateScore(item, terms);
      const shouldHighlight = options?.highlight ?? true;
      return {
        ...item,
        score,
        highlightedTitle: shouldHighlight ? highlightField(item.title, terms) : item.title,
        highlightedDescription: shouldHighlight ? highlightField(item.description, terms) : (item.description ?? ''),
        snippet: shouldHighlight ? extractSnippet(item.description ?? item.title, terms, 150) : (item.description ?? ''),
      };
    });

    const minScore = options?.minScore ?? 0;
    const filtered = scored.filter((r) => r.score >= minScore);

    const sort = options?.sort;
    if (sort && sort.column === 'score') {
      return { data: sortByScore(filtered), error: null };
    }
    if (sort && sort.column === 'title') {
      const dir = sort.direction === 'asc' ? 1 : -1;
      filtered.sort((a, b) => a.title.localeCompare(b.title) * dir);
    } else {
      return { data: sortByScore(filtered), error: null };
    }

    return { data: filtered, error: null };
  },

  async paginateSearch(query: string, page: number = 1, pageSize: number = 10, options?: EnhancedSearchOptions): Promise<PaginatedResult<EnhancedSearchResultItem>> {
    const { data, error } = await this.search(query, options);
    if (error) return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const paginated = data.slice(offset, offset + pageSize);
    return { data: paginated, total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },

  async searchByType(query: string, type: EnhancedSearchResultItem['type'], options?: Omit<EnhancedSearchOptions, 'types'>): Promise<{ data: EnhancedSearchResultItem[]; error: string | null }> {
    return this.search(query, { ...options, types: [type] });
  },

  async searchInBatch(query: string, batchId: string, options?: Omit<EnhancedSearchOptions, 'batchId'>): Promise<{ data: EnhancedSearchResultItem[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data: subjects } = await supabase.from('subjects').select('id').eq('batch_id', batchId);
    const subjectIds = (subjects ?? []).map((s: { id: string }) => s.id);
    const { data: chapters } = subjectIds.length > 0 ? await supabase.from('chapters').select('id').in('subject_id', subjectIds) : { data: [] };
    const chapterIds = (chapters ?? []).map((c: { id: string }) => c.id);
    const { data: classes } = chapterIds.length > 0 ? await supabase.from('classes').select('id').in('chapter_id', chapterIds) : { data: [] };
    const classIds = (classes ?? []).map((c: { id: string }) => c.id);

    const batchResults = await this.searchByType(query, 'batch', { ...options, batchId });
    const subjectResults = await this.searchByType(query, 'subject', { ...options, batchId });
    const chapterResults = subjectIds.length > 0 ? await this.searchByType(query, 'chapter', { ...options }) : { data: [], error: null };
    const classResults = chapterIds.length > 0 ? await this.searchByType(query, 'class', { ...options }) : { data: [], error: null };
    const videoResults = classIds.length > 0 ? await this.searchByType(query, 'video', { ...options }) : { data: [], error: null };
    const pdfResults = classIds.length > 0 ? await this.searchByType(query, 'pdf', { ...options }) : { data: [], error: null };
    const mcqResults = classIds.length > 0 ? await this.searchByType(query, 'mcq', { ...options }) : { data: [], error: null };

    const all = [
      ...batchResults.data,
      ...subjectResults.data,
      ...chapterResults.data.filter((r) => r.parentId && subjectIds.includes(r.parentId)),
      ...classResults.data.filter((r) => r.parentId && chapterIds.includes(r.parentId)),
      ...videoResults.data.filter((r) => r.parentId && classIds.includes(r.parentId)),
      ...pdfResults.data.filter((r) => r.parentId && classIds.includes(r.parentId)),
      ...mcqResults.data.filter((r) => r.parentId && classIds.includes(r.parentId)),
    ];

    return { data: sortByScore(all), error: null };
  },
};
