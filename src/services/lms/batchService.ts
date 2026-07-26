import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Batch, BatchInsert, BatchUpdate, BatchRow } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'batches';

function mapBatch(row: BatchRow): Batch {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    thumbnail: row.thumbnail,
    banner: row.banner,
    icon: row.icon,
    price: Number(row.price),
    discountPrice: row.discount_price !== null ? Number(row.discount_price) : null,
    isFree: row.is_free,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: BatchInsert): Record<string, unknown> {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    thumbnail: input.thumbnail ?? null,
    banner: input.banner ?? null,
    icon: input.icon ?? null,
    price: input.price ?? 0,
    discount_price: input.discountPrice ?? null,
    is_free: input.isFree ?? false,
    is_published: input.isPublished ?? false,
    sort_order: input.sortOrder ?? 0,
    status: input.status ?? 'draft',
  };
}

function toUpdateRow(input: BatchUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.thumbnail !== undefined) row.thumbnail = input.thumbnail;
  if (input.banner !== undefined) row.banner = input.banner;
  if (input.icon !== undefined) row.icon = input.icon;
  if (input.price !== undefined) row.price = input.price;
  if (input.discountPrice !== undefined) row.discount_price = input.discountPrice;
  if (input.isFree !== undefined) row.is_free = input.isFree;
  if (input.isPublished !== undefined) row.is_published = input.isPublished;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.status !== undefined) row.status = input.status;
  return row;
}

export interface BatchListOptions {
  publishedOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
}

export const batchService = {
  async getById(id: string): Promise<{ data: Batch | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) {
      logger.error('batchService.getById', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapBatch(data as BatchRow) : null, error: null };
  },

  async getBySlug(slug: string): Promise<{ data: Batch | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('slug', slug).maybeSingle();
    if (error) {
      logger.error('batchService.getBySlug', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapBatch(data as BatchRow) : null, error: null };
  },

  async list(options?: BatchListOptions): Promise<{ data: Batch[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');

    if (options?.publishedOnly) {
      query = query.eq('status', 'published');
    }

    if (options?.search) {
      query = query.ilike('title', `%${options.search}%`);
    }

    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });

    const { data, error } = await query;
    if (error) {
      logger.error('batchService.list', { error: error.message });
      return { data: [], error: error.message };
    }
    return { data: (data as BatchRow[]).map(mapBatch), error: null };
  },

  async paginate(
    page: number = 1,
    pageSize: number = 10,
    options?: BatchListOptions,
  ): Promise<PaginatedResult<Batch>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.search) countQuery = countQuery.ilike('title', `%${options.search}%`);
    const { count, error: countError } = await countQuery;
    if (countError) {
      logger.error('batchService.paginate count', { error: countError.message });
    }
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;

    let query = supabase.from(TABLE).select('*');
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;
    if (error) {
      logger.error('batchService.paginate', { error: error.message });
      return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
    }
    return {
      data: (data as BatchRow[]).map(mapBatch),
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },

  async create(input: BatchInsert): Promise<{ data: Batch | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) {
      logger.error('batchService.create', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapBatch(data as BatchRow) : null, error: null };
  },

  async update(id: string, input: BatchUpdate): Promise<{ data: Batch | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) {
      logger.error('batchService.update', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapBatch(data as BatchRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      logger.error('batchService.remove', { error: error.message });
      return { error: error.message };
    }
    return { error: null };
  },
};
