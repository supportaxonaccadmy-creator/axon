import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  Enrollment, EnrollmentInsert, EnrollmentUpdate, EnrollmentRow,
  EnrollmentStatus, EnrollmentType, BatchPricing,
} from '@/types/lms';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';
import { calculateExpiryFromPricing } from '@/lib/helpers/enrollmentHelper';

const TABLE = 'enrollments';

function mapEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id, profileId: row.profile_id, batchId: row.batch_id, pricingId: row.pricing_id,
    enrollmentType: row.enrollment_type, accessStatus: row.access_status,
    enrolledAt: row.enrolled_at, expiresAt: row.expires_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toRow(input: EnrollmentInsert): Record<string, unknown> {
  return {
    profile_id: input.profileId, batch_id: input.batchId, pricing_id: input.pricingId,
    enrollment_type: input.enrollmentType ?? 'purchase',
    access_status: input.accessStatus ?? 'active',
    enrolled_at: input.enrolledAt ?? new Date().toISOString(),
    expires_at: input.expiresAt ?? null,
  };
}

function toUpdateRow(input: EnrollmentUpdate): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.profileId !== undefined) row.profile_id = input.profileId;
  if (input.batchId !== undefined) row.batch_id = input.batchId;
  if (input.pricingId !== undefined) row.pricing_id = input.pricingId;
  if (input.enrollmentType !== undefined) row.enrollment_type = input.enrollmentType;
  if (input.accessStatus !== undefined) row.access_status = input.accessStatus;
  if (input.enrolledAt !== undefined) row.enrolled_at = input.enrolledAt;
  if (input.expiresAt !== undefined) row.expires_at = input.expiresAt;
  return row;
}

export interface EnrollmentListOptions {
  profileId?: string | undefined;
  batchId?: string | undefined;
  accessStatus?: EnrollmentStatus | undefined;
  enrollmentType?: EnrollmentType | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export const enrollmentService = {
  async getById(id: string): Promise<{ data: Enrollment | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('enrollmentService.getById', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapEnrollment(data as EnrollmentRow) : null, error: null };
  },

  async list(options?: EnrollmentListOptions): Promise<{ data: Enrollment[]; error: string | null }> {
    const supabase = getSupabaseClient();
    let query = supabase.from(TABLE).select('*');
    if (options?.profileId) query = query.eq('profile_id', options.profileId);
    if (options?.batchId) query = query.eq('batch_id', options.batchId);
    if (options?.accessStatus) query = query.eq('access_status', options.accessStatus);
    if (options?.enrollmentType) query = query.eq('enrollment_type', options.enrollmentType);
    const sort = options?.sort ?? { column: 'enrolled_at', direction: 'desc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    const { data, error } = await query;
    if (error) { logger.error('enrollmentService.list', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data as EnrollmentRow[]).map(mapEnrollment), error: null };
  },

  async paginate(page: number = 1, pageSize: number = 10, options?: EnrollmentListOptions): Promise<PaginatedResult<Enrollment>> {
    const supabase = getSupabaseClient();
    let countQuery = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (options?.profileId) countQuery = countQuery.eq('profile_id', options.profileId);
    if (options?.batchId) countQuery = countQuery.eq('batch_id', options.batchId);
    if (options?.accessStatus) countQuery = countQuery.eq('access_status', options.accessStatus);
    if (options?.enrollmentType) countQuery = countQuery.eq('enrollment_type', options.enrollmentType);
    const { count } = await countQuery;
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    let query = supabase.from(TABLE).select('*');
    if (options?.profileId) query = query.eq('profile_id', options.profileId);
    if (options?.batchId) query = query.eq('batch_id', options.batchId);
    if (options?.accessStatus) query = query.eq('access_status', options.accessStatus);
    if (options?.enrollmentType) query = query.eq('enrollment_type', options.enrollmentType);
    const sort = options?.sort ?? { column: 'enrolled_at', direction: 'desc' };
    query = query.order(sort.column, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await query;
    if (error) { logger.error('enrollmentService.paginate', { error: error.message }); return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false }; }
    return { data: (data as EnrollmentRow[]).map(mapEnrollment), total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  },

  async getStudentEnrollments(profileId: string): Promise<{ data: Enrollment[]; error: string | null }> {
    return this.list({ profileId, sort: { column: 'enrolled_at', direction: 'desc' } });
  },

  async isStudentEnrolled(profileId: string, batchId: string): Promise<{ enrolled: boolean; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('id, access_status, expires_at').eq('profile_id', profileId).eq('batch_id', batchId).maybeSingle();
    if (error) { logger.error('enrollmentService.isStudentEnrolled', { error: error.message }); return { enrolled: false, error: error.message }; }
    if (!data) return { enrolled: false, error: null };
    const row = data as EnrollmentRow;
    if (row.access_status === 'cancelled') return { enrolled: false, error: null };
    if (row.access_status === 'expired') return { enrolled: false, error: null };
    if (row.expires_at !== null && new Date(row.expires_at) < new Date()) return { enrolled: false, error: null };
    return { enrolled: true, error: null };
  },

  async getAccessibleBatches(profileId: string): Promise<{ data: Enrollment[]; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('*').eq('profile_id', profileId).eq('access_status', 'active').order('enrolled_at', { ascending: false });
    if (error) { logger.error('enrollmentService.getAccessibleBatches', { error: error.message }); return { data: [], error: error.message }; }
    const enrollments = (data as EnrollmentRow[]).map(mapEnrollment);
    const now = new Date();
    return { data: enrollments.filter((e) => e.expiresAt === null || new Date(e.expiresAt) > now), error: null };
  },

  async enrollStudent(profileId: string, batchId: string, pricingId: string, pricing?: BatchPricing | undefined, enrollmentType: EnrollmentType = 'purchase'): Promise<{ data: Enrollment | null; error: string | null }> {
    const enrolledAt = new Date().toISOString();
    const expiresAt = pricing ? calculateExpiryFromPricing(pricing, enrolledAt) : null;
    return this.create({ profileId, batchId, pricingId, enrollmentType, accessStatus: 'active', enrolledAt, expiresAt });
  },

  async create(input: EnrollmentInsert): Promise<{ data: Enrollment | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select('*').maybeSingle();
    if (error) { logger.error('enrollmentService.create', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapEnrollment(data as EnrollmentRow) : null, error: null };
  },

  async update(id: string, input: EnrollmentUpdate): Promise<{ data: Enrollment | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE).update(toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { logger.error('enrollmentService.update', { error: error.message }); return { data: null, error: error.message }; }
    return { data: data ? mapEnrollment(data as EnrollmentRow) : null, error: null };
  },

  async remove(id: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) { logger.error('enrollmentService.remove', { error: error.message }); return { error: error.message }; }
    return { error: null };
  },

  async cancelEnrollment(id: string): Promise<{ data: Enrollment | null; error: string | null }> {
    return this.update(id, { accessStatus: 'cancelled' });
  },

  async expireEnrollment(id: string): Promise<{ data: Enrollment | null; error: string | null }> {
    return this.update(id, { accessStatus: 'expired' });
  },

  async activateEnrollment(id: string): Promise<{ data: Enrollment | null; error: string | null }> {
    return this.update(id, { accessStatus: 'active' });
  },

  async purchaseBatch(profileId: string, batchId: string, pricingId: string, amount: number, currency: string = 'INR', paymentMethod: string | null = null, transactionReference: string | null = null, gateway: string = 'manual', pricing?: BatchPricing | undefined): Promise<{ purchase: import('@/types/lms').Purchase | null; enrollment: Enrollment | null; error: string | null }> {
    const { data: purchase, error: purchaseError } = await this.createPurchase(profileId, batchId, pricingId, amount, currency, paymentMethod, transactionReference, gateway);
    if (purchaseError || !purchase) return { purchase: null, enrollment: null, error: purchaseError };
    const { data: enrollment, error: enrollError } = await this.enrollStudent(profileId, batchId, pricingId, pricing, 'purchase');
    if (enrollError) return { purchase, enrollment: null, error: enrollError };
    return { purchase, enrollment, error: null };
  },

  async createPurchase(profileId: string, batchId: string, pricingId: string, amount: number, currency: string, paymentMethod: string | null, transactionReference: string | null, gateway: string): Promise<{ data: import('@/types/lms').Purchase | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('purchases').insert({
      profile_id: profileId, batch_id: batchId, pricing_id: pricingId,
      amount, currency, payment_status: 'completed',
      payment_method: paymentMethod, transaction_reference: transactionReference,
      gateway, purchased_at: new Date().toISOString(),
    }).select('*').maybeSingle();
    if (error) { logger.error('enrollmentService.createPurchase', { error: error.message }); return { data: null, error: error.message }; }
    const row = data as import('@/types/lms').PurchaseRow;
    return {
      data: {
        id: row.id, profileId: row.profile_id, batchId: row.batch_id, pricingId: row.pricing_id,
        amount: Number(row.amount), currency: row.currency, paymentStatus: row.payment_status,
        paymentMethod: row.payment_method, transactionReference: row.transaction_reference,
        gateway: row.gateway, purchasedAt: row.purchased_at,
        createdAt: row.created_at, updatedAt: row.updated_at,
      },
      error: null,
    };
  },
};
