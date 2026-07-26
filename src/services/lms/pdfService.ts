import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { PdfNote, PdfNoteInsert, PdfNoteUpdate, PdfNoteRow } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'pdf_notes';

function mapPdfNote(row: PdfNoteRow): PdfNote {
  return {
    id: row.id, classId: row.class_id, title: row.title, slug: row.slug,
    description: row.description, fileUrl: row.file_url, totalPages: row.total_pages,
    fileSize: row.file_size, isDownloadable: row.is_downloadable, status: row.status,
    sortOrder: row.sort_order, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toRow(input: PdfNoteInsert): Record<string, unknown> {
  return {
    class_id: input.classId, title: input.title, slug: input.slug,
    description: input.description ?? null, file_url: input.fileUrl ?? null,
    total_pages: input.totalPages ?? null, file_size: input.fileSize ?? null,
    is_downloadable: input.isDownloadable ?? false, status: input.status ?? 'draft',
    sort_order: input.sortOrder ?? 0,
  };
}

function toUpdateRow(input: PdfNoteUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.classId !== undefined) row.class_id = input.classId;
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.fileUrl !== undefined) row.file_url = input.fileUrl;
  if (input.totalPages !== undefined) row.total_pages = input.totalPages;
  if (input.fileSize !== undefined) row.file_size = input.fileSize;
  if (input.isDownloadable !== undefined) row.is_downloadable = input.isDownloadable;
  if (input.status !== undefined) row.status = input.status;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  return row;
}

export interface PdfListOptions {
  classId?: string | undefined;
  publishedOnly?: boolean | undefined;
  downloadableOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
}

export const pdfService = {
  async getById(id: string): Promise<{ data: PdfNote | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('pdfService.getById', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPdfNote(data as PdfNoteRow) : null, error: null };
  },

  async getBySlug(classId: string, slug: string): Promise<{ data: PdfNote | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('class_id', classId).eq('slug', slug).maybeSingle();
    if (error) { logger.error('pdfService.getBySlug', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPdfNote(data as PdfNoteRow) : null, error: null };
  },

  async list(options?: PdfListOptions): Promise<{ data: PdfNote[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.classId) query = query.eq('class_id', options.classId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.downloadableOnly) query = query.eq('is_downloadable', true);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) { logger.error('pdfService.list', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as PdfNoteRow[]).map(mapPdfNote), error: null };
  },

  async paginate(page: number = 1, pageSize: number = 10, options?: PdfListOptions): Promise<PaginatedResult<PdfNote>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.classId) countQuery = countQuery.eq('class_id', options.classId);
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.downloadableOnly) countQuery = countQuery.eq('is_downloadable', true);
    if (options?.search) countQuery = countQuery.ilike('title', `%${options.search}%`);
    const { count } = await countQuery;
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    let query = supabase.from(TABLE).select('*');
    if (options?.classId) query = query.eq('class_id', options.classId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.downloadableOnly) query = query.eq('is_downloadable', true);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await query;
    if (error) { logger.error('pdfService.paginate', { error: error.message }); return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false }; }
    return { data: (data as PdfNoteRow[]).map(mapPdfNote), total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },

  async create(input: PdfNoteInsert): Promise<{ data: PdfNote | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) { logger.error('pdfService.create', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPdfNote(data as PdfNoteRow) : null, error: null };
  },

  async update(id: string, input: PdfNoteUpdate): Promise<{ data: PdfNote | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { logger.error('pdfService.update', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPdfNote(data as PdfNoteRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) { logger.error('pdfService.remove', { error: error.message }); return { error: error.message }; }
    return { error: null };
  },

  async publish(id: string): Promise<{ data: PdfNote | null; error: string | null }> {
    return this.update(id, { status: 'published' });
  },

  async unpublish(id: string): Promise<{ data: PdfNote | null; error: string | null }> {
    return this.update(id, { status: 'draft' });
  },

  async updateSortOrder(id: string, sortOrder: number): Promise<{ data: PdfNote | null; error: string | null }> {
    return this.update(id, { sortOrder });
  },
};
