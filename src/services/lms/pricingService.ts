import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { BatchPricing, BatchPricingInsert, BatchPricingUpdate, BatchPricingRow } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'batch_pricing';

function mapPricing(row: BatchPricingRow): BatchPricing {
  return {
    id: row.id, batchId: row.batch_id, price: Number(row.price),
    salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
    currency: row.currency, isFree: row.is_free, lifetimeAccess: row.lifetime_access,
    accessDurationDays: row.access_duration_days, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toRow(input: BatchPricingInsert): Record<string, unknown> {
  return {
    batch_id: input.batchId, price: input.price ?? 0, sale_price: input.salePrice ?? null,
    currency: input.currency ?? 'INR', is_free: input.isFree ?? false,
    lifetime_access: input.lifetimeAccess ?? false,
    access_duration_days: input.accessDurationDays ?? null,
    status: input.status ?? 'draft',
  };
}

function toUpdateRow(input: BatchPricingUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.batchId !== undefined) row.batch_id = input.batchId;
  if (input.price !== undefined) row.price = input.price;
  if (input.salePrice !== undefined) row.sale_price = input.salePrice;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.isFree !== undefined) row.is_free = input.isFree;
  if (input.lifetimeAccess !== undefined) row.lifetime_access = input.lifetimeAccess;
  if (input.accessDurationDays !== undefined) row.access_duration_days = input.accessDurationDays;
  if (input.status !== undefined) row.status = input.status;
  return row;
}

export interface PricingListOptions {
  batchId?: string | undefined;
  publishedOnly?: boolean | undefined;
  freeOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export const pricingService = {
  async getById(id: string): Promise<{ data: BatchPricing | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('pricingService.getById', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPricing(data as BatchPricingRow) : null, error: null };
  },

  async getByBatchId(batchId: string): Promise<{ data: BatchPricing | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('batch_id', batchId).maybeSingle();
    if (error) { logger.error('pricingService.getByBatchId', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPricing(data as BatchPricingRow) : null, error: null };
  },

  async list(options?: PricingListOptions): Promise<{ data: BatchPricing[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.batchId) query = query.eq('batch_id', options.batchId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.freeOnly) query = query.eq('is_free', true);
    const sort = options?.sort ?? { column: 'created_at', direction: 'desc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) { logger.error('pricingService.list', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as BatchPricingRow[]).map(mapPricing), error: null };
  },

  async paginate(page: number = 1, pageSize: number = 10, options?: PricingListOptions): Promise<PaginatedResult<BatchPricing>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.batchId) countQuery = countQuery.eq('batch_id', options.batchId);
    if (options?.publishedOnly) countQuery = countQuery.eq('status', 'published');
    if (options?.freeOnly) countQuery = countQuery.eq('is_free', true);
    const { count } = await countQuery;
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    let query = supabase.from(TABLE).select('*');
    if (options?.batchId) query = query.eq('batch_id', options.batchId);
    if (options?.publishedOnly) query = query.eq('status', 'published');
    if (options?.freeOnly) query = query.eq('is_free', true);
    const sort = options?.sort ?? { column: 'created_at', direction: 'desc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await query;
    if (error) { logger.error('pricingService.paginate', { error: error.message }); return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false }; }
    return { data: (data as BatchPricingRow[]).map(mapPricing), total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },

  async create(input: BatchPricingInsert): Promise<{ data: BatchPricing | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) { logger.error('pricingService.create', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPricing(data as BatchPricingRow) : null, error: null };
  },

  async update(id: string, input: BatchPricingUpdate): Promise<{ data: BatchPricing | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { logger.error('pricingService.update', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPricing(data as BatchPricingRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) { logger.error('pricingService.remove', { error: error.message }); return { error: error.message }; }
    return { error: null };
  },
};
