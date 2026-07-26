import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Purchase, PurchaseInsert, PurchaseUpdate, PurchaseRow, PaymentStatus } from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

const TABLE = 'purchases';

function mapPurchase(row: PurchaseRow): Purchase {
  return {
    id: row.id, profileId: row.profile_id, batchId: row.batch_id, pricingId: row.pricing_id,
    amount: Number(row.amount), currency: row.currency, paymentStatus: row.payment_status,
    paymentMethod: row.payment_method, transactionReference: row.transaction_reference,
    gateway: row.gateway, purchasedAt: row.purchased_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toRow(input: PurchaseInsert): Record<string, unknown> {
  return {
    profile_id: input.profileId, batch_id: input.batchId, pricing_id: input.pricingId,
    amount: input.amount, currency: input.currency ?? 'INR',
    payment_status: input.paymentStatus ?? 'pending',
    payment_method: input.paymentMethod ?? null,
    transaction_reference: input.transactionReference ?? null,
    gateway: input.gateway ?? 'manual',
    purchased_at: input.purchasedAt ?? new Date().toISOString(),
  };
}

function toUpdateRow(input: PurchaseUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.profileId !== undefined) row.profile_id = input.profileId;
  if (input.batchId !== undefined) row.batch_id = input.batchId;
  if (input.pricingId !== undefined) row.pricing_id = input.pricingId;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.paymentStatus !== undefined) row.payment_status = input.paymentStatus;
  if (input.paymentMethod !== undefined) row.payment_method = input.paymentMethod;
  if (input.transactionReference !== undefined) row.transaction_reference = input.transactionReference;
  if (input.gateway !== undefined) row.gateway = input.gateway;
  if (input.purchasedAt !== undefined) row.purchased_at = input.purchasedAt;
  return row;
}

export interface PurchaseListOptions {
  profileId?: string | undefined;
  batchId?: string | undefined;
  paymentStatus?: PaymentStatus | undefined;
  gateway?: string | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export const purchaseService = {
  async getById(id: string): Promise<{ data: Purchase | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('purchaseService.getById', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPurchase(data as PurchaseRow) : null, error: null };
  },

  async list(options?: PurchaseListOptions): Promise<{ data: Purchase[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.profileId) query = query.eq('profile_id', options.profileId);
    if (options?.batchId) query = query.eq('batch_id', options.batchId);
    if (options?.paymentStatus) query = query.eq('payment_status', options.paymentStatus);
    if (options?.gateway) query = query.eq('gateway', options.gateway);
    const sort = options?.sort ?? { column: 'purchased_at', direction: 'desc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) { logger.error('purchaseService.list', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as PurchaseRow[]).map(mapPurchase), error: null };
  },

  async paginate(page: number = 1, pageSize: number = 10, options?: PurchaseListOptions): Promise<PaginatedResult<Purchase>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.profileId) countQuery = countQuery.eq('profile_id', options.profileId);
    if (options?.batchId) countQuery = countQuery.eq('batch_id', options.batchId);
    if (options?.paymentStatus) countQuery = countQuery.eq('payment_status', options.paymentStatus);
    if (options?.gateway) countQuery = countQuery.eq('gateway', options.gateway);
    const { count } = await countQuery;
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    let query = supabase.from(TABLE).select('*');
    if (options?.profileId) query = query.eq('profile_id', options.profileId);
    if (options?.batchId) query = query.eq('batch_id', options.batchId);
    if (options?.paymentStatus) query = query.eq('payment_status', options.paymentStatus);
    if (options?.gateway) query = query.eq('gateway', options.gateway);
    const sort = options?.sort ?? { column: 'purchased_at', direction: 'desc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await query;
    if (error) { logger.error('purchaseService.paginate', { error: error.message }); return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false }; }
    return { data: (data as PurchaseRow[]).map(mapPurchase), total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },

  async getStudentPurchases(profileId: string): Promise<{ data: Purchase[]; error: string | null }> {
    return this.list({ profileId, sort: { column: 'purchased_at', direction: 'desc' } });
  },

  async create(input: PurchaseInsert): Promise<{ data: Purchase | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) { logger.error('purchaseService.create', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPurchase(data as PurchaseRow) : null, error: null };
  },

  async update(id: string, input: PurchaseUpdate): Promise<{ data: Purchase | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { logger.error('purchaseService.update', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapPurchase(data as PurchaseRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) { logger.error('purchaseService.remove', { error: error.message }); return { error: error.message }; }
    return { error: null };
  },

  async updatePaymentStatus(id: string, status: PaymentStatus, transactionReference?: string | undefined): Promise<{ data: Purchase | null; error: string | null }> {
    const update: PurchaseUpdate = { paymentStatus: status };
    if (transactionReference !== undefined) update.transactionReference = transactionReference;
    return this.update(id, update);
  },
};
