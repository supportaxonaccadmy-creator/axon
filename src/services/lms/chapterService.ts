import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Chapter, ChapterInsert, ChapterUpdate, ChapterRow } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'chapters';

function mapChapter(row: ChapterRow): Chapter {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: ChapterInsert): Record<string, unknown> {
  return {
    subject_id: input.subjectId,
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    sort_order: input.sortOrder ?? 0,
    status: input.status ?? 'draft',
  };
}

function toUpdateRow(input: ChapterUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.subjectId !== undefined) row.subject_id = input.subjectId;
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.status !== undefined) row.status = input.status;
  return row;
}

export interface ChapterListOptions {
  subjectId?: string | undefined;
  publishedOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
}

export const chapterService = {
  async getById(id: string): Promise<{ data: Chapter | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) {
      logger.error('chapterService.getById', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapChapter(data as ChapterRow) : null, error: null };
  },

  async getBySlug(subjectId: string, slug: string): Promise<{ data: Chapter | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('subject_id', subjectId)
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      logger.error('chapterService.getBySlug', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapChapter(data as ChapterRow) : null, error: null };
  },

  async list(options?: ChapterListOptions): Promise<{ data: Chapter[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.subjectId) query = query.eq('subject_id', options.subjectId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) {
      logger.error('chapterService.list', { error: error.message });
      return { data: [], error: error.message };
    }
    return { data: (data as ChapterRow[]).map(mapChapter), error: null };
  },

  async paginate(
    page: number = 1,
    pageSize: number = 10,
    options?: ChapterListOptions,
  ): Promise<PaginatedResult<Chapter>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.subjectId) countQuery = countQuery.eq('subject_id', options.subjectId);
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.search) countQuery = countQuery.ilike('title', `%${options.search}%`);
    const { count, error: countError } = await countQuery;
    if (countError) logger.error('chapterService.paginate count', { error: countError.message });
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;

    let query = supabase.from(TABLE).select('*');
    if (options?.subjectId) query = query.eq('subject_id', options.subjectId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;
    if (error) {
      logger.error('chapterService.paginate', { error: error.message });
      return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
    }
    return {
      data: (data as ChapterRow[]).map(mapChapter),
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },

  async create(input: ChapterInsert): Promise<{ data: Chapter | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) {
      logger.error('chapterService.create', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapChapter(data as ChapterRow) : null, error: null };
  },

  async update(id: string, input: ChapterUpdate): Promise<{ data: Chapter | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) {
      logger.error('chapterService.update', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapChapter(data as ChapterRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      logger.error('chapterService.remove', { error: error.message });
      return { error: error.message };
    }
    return { error: null };
  },
};
