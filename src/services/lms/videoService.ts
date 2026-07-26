import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Video, VideoInsert, VideoUpdate, VideoRow } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'videos';

function mapVideo(row: VideoRow): Video {
  return {
    id: row.id,
    classId: row.class_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    youtubeUrl: row.youtube_url,
    videoUrl: row.video_url,
    duration: row.duration,
    thumbnail: row.thumbnail,
    isPreview: row.is_preview,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: VideoInsert): Record<string, unknown> {
  return {
    class_id: input.classId,
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    youtube_url: input.youtubeUrl ?? null,
    video_url: input.videoUrl ?? null,
    duration: input.duration ?? null,
    thumbnail: input.thumbnail ?? null,
    is_preview: input.isPreview ?? false,
    status: input.status ?? 'draft',
    sort_order: input.sortOrder ?? 0,
  };
}

function toUpdateRow(input: VideoUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.classId !== undefined) row.class_id = input.classId;
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.youtubeUrl !== undefined) row.youtube_url = input.youtubeUrl;
  if (input.videoUrl !== undefined) row.video_url = input.videoUrl;
  if (input.duration !== undefined) row.duration = input.duration;
  if (input.thumbnail !== undefined) row.thumbnail = input.thumbnail;
  if (input.isPreview !== undefined) row.is_preview = input.isPreview;
  if (input.status !== undefined) row.status = input.status;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  return row;
}

export interface VideoListOptions {
  classId?: string | undefined;
  publishedOnly?: boolean | undefined;
  previewOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
}

export const videoService = {
  async getById(id: string): Promise<{ data: Video | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('videoService.getById', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapVideo(data as VideoRow) : null, error: null };
  },

  async getBySlug(classId: string, slug: string): Promise<{ data: Video | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('class_id', classId).eq('slug', slug).maybeSingle();
    if (error) { logger.error('videoService.getBySlug', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapVideo(data as VideoRow) : null, error: null };
  },

  async list(options?: VideoListOptions): Promise<{ data: Video[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.classId) query = query.eq('class_id', options.classId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.previewOnly) query = query.eq('is_preview', true);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) { logger.error('videoService.list', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as VideoRow[]).map(mapVideo), error: null };
  },

  async paginate(page: number = 1, pageSize: number = 10, options?: VideoListOptions): Promise<PaginatedResult<Video>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.classId) countQuery = countQuery.eq('class_id', options.classId);
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.previewOnly) countQuery = countQuery.eq('is_preview', true);
    if (options?.search) countQuery = countQuery.ilike('title', `%${options.search}%`);
    const { count } = await countQuery;
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    let query = supabase.from(TABLE).select('*');
    if (options?.classId) query = query.eq('class_id', options.classId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.previewOnly) query = query.eq('is_preview', true);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    const sort = options?.sort ?? { column: 'sort_order', direction: 'asc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await query;
    if (error) { logger.error('videoService.paginate', { error: error.message }); return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false }; }
    return { data: (data as VideoRow[]).map(mapVideo), total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },

  async create(input: VideoInsert): Promise<{ data: Video | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) { logger.error('videoService.create', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapVideo(data as VideoRow) : null, error: null };
  },

  async update(id: string, input: VideoUpdate): Promise<{ data: Video | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { logger.error('videoService.update', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapVideo(data as VideoRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) { logger.error('videoService.remove', { error: error.message }); return { error: error.message }; }
    return { error: null };
  },

  async publish(id: string): Promise<{ data: Video | null; error: string | null }> {
    return this.update(id, { status: 'published' });
  },

  async unpublish(id: string): Promise<{ data: Video | null; error: string | null }> {
    return this.update(id, { status: 'draft' });
  },

  async updateSortOrder(id: string, sortOrder: number): Promise<{ data: Video | null; error: string | null }> {
    return this.update(id, { sortOrder });
  },
};
