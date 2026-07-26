import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Subject, SubjectInsert, SubjectUpdate, SubjectRow } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'subjects';

function mapSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    batchId: row.batch_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: SubjectInsert): Record<string, unknown> {
  return {
    batch_id: input.batchId,
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    icon: input.icon ?? null,
    sort_order: input.sortOrder ?? 0,
    status: input.status ?? 'draft',
  };
}

function toUpdateRow(input: SubjectUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.batchId !== undefined) row.batch_id = input.batchId;
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.icon !== undefined) row.icon = input.icon;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.status !== undefined) row.status = input.status;
  return row;
}

export interface SubjectListOptions {
  batchId?: string | undefined;
  publishedOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
}

export const subjectService = {
  async getById(id: string): Promise<{ data: Subject | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) {
      logger.error('subjectService.getById', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapSubject(data as SubjectRow) : null, error: null };
  },

  async getBySlug(batchId: string, slug: string): Promise<{ data: Subject | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('batch_id', batchId)
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      logger.error('subjectService.getBySlug', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapSubject(data as SubjectRow) : null, error: null };
  },

  async list(options?: SubjectListOptions): Promise<{ data: Subject[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.batchId) query = query.eq('batch_id', options.batchId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) {
      logger.error('subjectService.list', { error: error.message });
      return { data: [], error: error.message };
    }
    return { data: (data as SubjectRow[]).map(mapSubject), error: null };
  },

  async paginate(
    page: number = 1,
    pageSize: number = 10,
    options?: SubjectListOptions,
  ): Promise<PaginatedResult<Subject>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.batchId) countQuery = countQuery.eq('batch_id', options.batchId);
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.search) countQuery = countQuery.ilike('title', `%${options.search}%`);
    const { count, error: countError } = await countQuery;
    if (countError) logger.error('subjectService.paginate count', { error: countError.message });
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;

    let query = supabase.from(TABLE).select('*');
    if (options?.batchId) query = query.eq('batch_id', options.batchId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;
    if (error) {
      logger.error('subjectService.paginate', { error: error.message });
      return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false };
    }
    return {
      data: (data as SubjectRow[]).map(mapSubject),
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },

  async create(input: SubjectInsert): Promise<{ data: Subject | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) {
      logger.error('subjectService.create', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapSubject(data as SubjectRow) : null, error: null };
  },

  async update(id: string, input: SubjectUpdate): Promise<{ data: Subject | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) {
      logger.error('subjectService.update', { error: error.message });
      return { data: null, error: error.message };
    }
    return { data: data ? mapSubject(data as SubjectRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      logger.error('subjectService.remove', { error: error.message });
      return { error: error.message };
    }
    return { error: null };
  },
};
