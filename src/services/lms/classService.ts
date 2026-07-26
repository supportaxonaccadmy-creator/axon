import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Class, ClassInsert, ClassUpdate, ClassRow } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'classes';

function mapClass(row: ClassRow): Class {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    thumbnail: row.thumbnail,
    duration: row.duration,
    sortOrder: row.sort_order,
    isPreview: row.is_preview,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: ClassInsert): Record<string, unknown> {
  return {
    chapter_id: input.chapterId,
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    thumbnail: input.thumbnail ?? null,
    duration: input.duration ?? null,
    sort_order: input.sortOrder ?? 0,
    is_preview: input.isPreview ?? false,
    status: input.status ?? 'draft',
  };
}

function toUpdateRow(input: ClassUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.chapterId !== undefined) row.chapter_id = input.chapterId;
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.thumbnail !== undefined) row.thumbnail = input.thumbnail;
  if (input.duration !== undefined) row.duration = input.duration;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.isPreview !== undefined) row.is_preview = input.isPreview;
  if (input.status !== undefined) row.status = input.status;
  return row;
}

export interface ClassListOptions {
  chapterId?: string | undefined;
  publishedOnly?: boolean | undefined;
  previewOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
}

export const classService = {
  async getById(id: string): Promise<{ data: Class | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) {
      logger.error('classService.getById', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapClass(data as ClassRow) : null, error: null };
  },

  async getBySlug(chapterId: string, slug: string): Promise<{ data: Class | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      logger.error('classService.getBySlug', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapClass(data as ClassRow) : null, error: null };
  },

  async list(options?: ClassListOptions): Promise<{ data: Class[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.chapterId) query = query.eq('chapter_id', options.chapterId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.previewOnly) query = query.eq('is_preview', true);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) {
      logger.error('classService.list', { error: error.message });
      return { data: [], error: error.message };
    }
    return { data: (data as ClassRow[]).map(mapClass), error: null };
  },

  async paginate(
    page: number = 1,
    pageSize: number = 10,
    options?: ClassListOptions,
  ): Promise<PaginatedResult<Class>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.chapterId) countQuery = countQuery.eq('chapter_id', options.chapterId);
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.previewOnly) countQuery = countQuery.eq('is_preview', true);
    if (options?.search) countQuery = countQuery.ilike('title', `%${options.search}%`);
    const { count, error: countError } = await countQuery;
    if (countError) logger.error('classService.paginate count', { error: countError.message });
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;

    let query = supabase.from(TABLE).select('*');
    if (options?.chapterId) query = query.eq('chapter_id', options.chapterId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.previewOnly) query = query.eq('is_preview', true);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;
    if (error) {
      logger.error('classService.paginate', { error: error.message });
      return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
    }
    return {
      data: (data as ClassRow[]).map(mapClass),
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },

  async create(input: ClassInsert): Promise<{ data: Class | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) {
      logger.error('classService.create', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapClass(data as ClassRow) : null, error: null };
  },

  async update(id: string, input: ClassUpdate): Promise<{ data: Class | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) {
      logger.error('classService.update', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapClass(data as ClassRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      logger.error('classService.remove', { error: error.message });
      return { error: error.message };
    }
    return { error: null };
  },
};
