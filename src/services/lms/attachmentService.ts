import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Attachment, AttachmentInsert, AttachmentUpdate, AttachmentRow } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'attachments';

function mapAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.id, classId: row.class_id, title: row.title, fileUrl: row.file_url,
    fileType: row.file_type, fileSize: row.file_size, status: row.status,
    sortOrder: row.sort_order, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toRow(input: AttachmentInsert): Record<string, unknown> {
  return {
    class_id: input.classId, title: input.title, file_url: input.fileUrl ?? null,
    file_type: input.fileType ?? null, file_size: input.fileSize ?? null,
    status: input.status ?? 'draft', sort_order: input.sortOrder ?? 0,
  };
}

function toUpdateRow(input: AttachmentUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.classId !== undefined) row.class_id = input.classId;
  if (input.title !== undefined) row.title = input.title;
  if (input.fileUrl !== undefined) row.file_url = input.fileUrl;
  if (input.fileType !== undefined) row.file_type = input.fileType;
  if (input.fileSize !== undefined) row.file_size = input.fileSize;
  if (input.status !== undefined) row.status = input.status;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  return row;
}

export interface AttachmentListOptions {
  classId?: string | undefined;
  publishedOnly?: boolean | undefined;
  fileType?: string | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
}

export const attachmentService = {
  async getById(id: string): Promise<{ data: Attachment | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('attachmentService.getById', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapAttachment(data as AttachmentRow) : null, error: null };
  },

  async list(options?: AttachmentListOptions): Promise<{ data: Attachment[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.classId) query = query.eq('class_id', options.classId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.fileType) query = query.eq('file_type', options.fileType);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) { logger.error('attachmentService.list', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as AttachmentRow[]).map(mapAttachment), error: null };
  },

  async paginate(page: number = 1, pageSize: number = 10, options?: AttachmentListOptions): Promise<PaginatedResult<Attachment>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.classId) countQuery = countQuery.eq('class_id', options.classId);
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.fileType) countQuery = countQuery.eq('file_type', options.fileType);
    if (options?.search) countQuery = countQuery.ilike('title', `%${options.search}%`);
    const { count } = await countQuery;
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    let query = supabase.from(TABLE).select('*');
    if (options?.classId) query = query.eq('class_id', options.classId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.fileType) query = query.eq('file_type', options.fileType);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await query;
    if (error) { logger.error('attachmentService.paginate', { error: error.message }); return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false }; }
    return { data: (data as AttachmentRow[]).map(mapAttachment), total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },

  async create(input: AttachmentInsert): Promise<{ data: Attachment | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) { logger.error('attachmentService.create', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapAttachment(data as AttachmentRow) : null, error: null };
  },

  async update(id: string, input: AttachmentUpdate): Promise<{ data: Attachment | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { logger.error('attachmentService.update', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapAttachment(data as AttachmentRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) { logger.error('attachmentService.remove', { error: error.message }); return { error: error.message }; }
    return { error: null };
  },

  async publish(id: string): Promise<{ data: Attachment | null; error: string | null }> {
    return this.update(id, { status: 'published' });
  },

  async unpublish(id: string): Promise<{ data: Attachment | null; error: string | null }> {
    return this.update(id, { status: 'draft' });
  },

  async updateSortOrder(id: string, sortOrder: number): Promise<{ data: Attachment | null; error: string | null }> {
    return this.update(id, { sortOrder });
  },
};
