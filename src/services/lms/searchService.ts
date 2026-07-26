import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

export interface SearchResultItem {
  id: string;
  type: 'batch' | 'subject' | 'chapter' | 'class' | 'video' | 'pdf' | 'mcq';
  title: string;
  slug: string;
  description: string | null;
  status: string;
}

export interface SearchOptions {
  types?: ('batch' | 'subject' | 'chapter' | 'class' | 'video' | 'pdf' | 'mcq')[] | undefined;
  publishedOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

const TABLE_MAP: Record<string, { table: string; type: SearchResultItem['type'] }> = {
  batch: { table: 'batches', type: 'batch' },
  subject: { table: 'subjects', type: 'subject' },
  chapter: { table: 'chapters', type: 'chapter' },
  class: { table: 'classes', type: 'class' },
  video: { table: 'videos', type: 'video' },
  pdf: { table: 'pdf_notes', type: 'pdf' },
  mcq: { table: 'mcq_sets', type: 'mcq' },
};

export const searchService = {
  async search(query: string, options?: SearchOptions): Promise<{ data: SearchResultItem[]; error: string | null }> {
    if (!query || query.trim().length === 0) return { data: [], error: null };
    const types = options?.types ?? ['batch', 'subject', 'chapter', 'class', 'video', 'pdf', 'mcq'];
    const supabase = getSupabaseClient();
    const results: SearchResultItem[] = [];

    for (const typeKey of types) {
      const mapping = TABLE_MAP[typeKey];
      if (!mapping) continue;
      let q = supabase.from(mapping.table).select('id, title, slug, description, status').ilike('title', `%${query}%`);
      if (options?.publishedOnly) q = q.eq('status', 'published');
      q = q.limit(20);
      const { data, error } = await q;
      if (error) { logger.error(`searchService.search.${typeKey}`, { error: error.message }); continue; }
      for (const row of data ?? []) {
        results.push({
          id: row.id, type: mapping.type, title: row.title, slug: row.slug,
          description: row.description, status: row.status,
        });
      }
    }

    const sort = options?.sort ?? { column: 'title', direction: 'asc' };
    results.sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      if (sort.column === 'title') return a.title.localeCompare(b.title) * dir;
      return 0;
    });

    return { data: results, error: null };
  },

  async paginateSearch(query: string, page: number = 1, pageSize: number = 10, options?: SearchOptions): Promise<PaginatedResult<SearchResultItem>> {
    const { data, error } = await this.search(query, options);
    if (error) return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const paginated = data.slice(offset, offset + pageSize);
    return { data: paginated, total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },
};
