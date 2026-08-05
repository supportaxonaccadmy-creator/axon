import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Coupon, CouponValidationResult, CouponDiscountType } from './finance.types';

class CouponService {
  async getCoupons(activeOnly = false): Promise<Coupon[]> {
    const supabase = getSupabaseClient();
    let query = supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) { logger.error('CouponService.getCoupons', { error: error.message }); return []; }
    return (data ?? []).map((r: Record<string, unknown>) => this.mapCoupon(r));
  }
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true).maybeSingle();
    if (error || !data) return null;
    return this.mapCoupon(data);
  }
  async createCoupon(params: { code: string; description?: string; discountType: CouponDiscountType; discountValue: number; maxDiscount?: number; minOrderAmount?: number; batchId?: string; profileId?: string; firstPurchaseOnly?: boolean; autoApply?: boolean; maxUses?: number; startsAt?: string; expiresAt?: string; createdBy?: string }): Promise<Coupon | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('coupons').insert({ code: params.code.toUpperCase(), description: params.description ?? null, discount_type: params.discountType, discount_value: params.discountValue, max_discount: params.maxDiscount ?? null, min_order_amount: params.minOrderAmount ?? 0, batch_id: params.batchId ?? null, profile_id: params.profileId ?? null, first_purchase_only: params.firstPurchaseOnly ?? false, auto_apply: params.autoApply ?? false, max_uses: params.maxUses ?? null, starts_at: params.startsAt ?? null, expires_at: params.expiresAt ?? null, created_by: params.createdBy ?? null }).select('*').single();
    if (error) { logger.error('CouponService.createCoupon', { error: error.message }); return null; }
    return this.mapCoupon(data);
  }
  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<boolean> {
    const supabase = getSupabaseClient();
    const updateData: Record<string, unknown> = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.discountValue !== undefined) updateData.discount_value = updates.discountValue;
    if (updates.maxDiscount !== undefined) updateData.max_discount = updates.maxDiscount;
    if (updates.minOrderAmount !== undefined) updateData.min_order_amount = updates.minOrderAmount;
    if (updates.maxUses !== undefined) updateData.max_uses = updates.maxUses;
    if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.autoApply !== undefined) updateData.auto_apply = updates.autoApply;
    const { error } = await supabase.from('coupons').update(updateData).eq('id', id);
    if (error) { logger.error('CouponService.updateCoupon', { error: error.message }); return false; }
    return true;
  }
  async deleteCoupon(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) { logger.error('CouponService.deleteCoupon', { error: error.message }); return false; }
    return true;
  }
  async validateCoupon(code: string, orderAmount: number, profileId: string, batchId?: string, isFirstPurchase?: boolean): Promise<CouponValidationResult> {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) return { valid: false, discountAmount: 0, message: 'Coupon not found or inactive', coupon: null };
    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) return { valid: false, discountAmount: 0, message: 'Coupon not yet active', coupon };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return { valid: false, discountAmount: 0, message: 'Coupon has expired', coupon };
    if (coupon.minOrderAmount > orderAmount) return { valid: false, discountAmount: 0, message: `Minimum order amount is ₹${coupon.minOrderAmount}`, coupon };
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { valid: false, discountAmount: 0, message: 'Coupon usage limit reached', coupon };
    if (coupon.batchId && batchId && coupon.batchId !== batchId) return { valid: false, discountAmount: 0, message: 'Coupon not valid for this batch', coupon };
    if (coupon.profileId && coupon.profileId !== profileId) return { valid: false, discountAmount: 0, message: 'Coupon not valid for this user', coupon };
    if (coupon.firstPurchaseOnly && !isFirstPurchase) return { valid: false, discountAmount: 0, message: 'Coupon valid for first purchase only', coupon };
    let discountAmount = 0;
    if (coupon.discountType === 'flat') discountAmount = coupon.discountValue;
    else discountAmount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
    if (discountAmount > orderAmount) discountAmount = orderAmount;
    return { valid: true, discountAmount: Math.round(discountAmount * 100) / 100, message: `Discount: ₹${discountAmount}`, coupon };
  }
  async recordUsage(couponId: string, profileId: string, discountAmount: number, purchaseId?: string, orderId?: string): Promise<void> {
    const supabase = getSupabaseClient();
    await supabase.from('coupon_usage').insert({ coupon_id: couponId, profile_id: profileId, purchase_id: purchaseId ?? null, order_id: orderId ?? null, discount_amount: discountAmount });
    await supabase.rpc('increment_coupon_used_count', { coupon_id: couponId }).then(() => {}, () => { supabase.from('coupons').update({ used_count: couponId }).eq('id', couponId); });
  }
  async getCouponAnalytics(): Promise<{ totalCoupons: number; activeCoupons: number; totalUsed: number; totalDiscount: number; topCoupons: { code: string; used: number; discount: number }[] }> {
    const supabase = getSupabaseClient();
    const { data: coupons } = await supabase.from('coupons').select('id, code, is_active, used_count');
    const { data: usage } = await supabase.from('coupon_usage').select('coupon_id, discount_amount');
    const couponRows = coupons ?? [];
    const usageRows = usage ?? [];
    const usageMap = new Map<string, { used: number; discount: number }>();
    for (const u of usageRows) { const cid = u.coupon_id as string; const existing = usageMap.get(cid) ?? { used: 0, discount: 0 }; usageMap.set(cid, { used: existing.used + 1, discount: existing.discount + Number(u.discount_amount) }); }
    const topCoupons = couponRows.map((c: Record<string, unknown>) => ({ code: c.code as string, used: usageMap.get(c.id as string)?.used ?? 0, discount: usageMap.get(c.id as string)?.discount ?? 0 })).sort((a, b) => b.used - a.used).slice(0, 5);
    return { totalCoupons: couponRows.length, activeCoupons: couponRows.filter((c: Record<string, unknown>) => c.is_active).length, totalUsed: usageRows.length, totalDiscount: usageRows.reduce((sum: number, u: Record<string, unknown>) => sum + Number(u.discount_amount), 0), topCoupons };
  }
  private mapCoupon(r: Record<string, unknown>): Coupon { return { id: r.id as string, code: r.code as string, description: r.description as string | null, discountType: r.discount_type as CouponDiscountType, discountValue: Number(r.discount_value), maxDiscount: r.max_discount !== null ? Number(r.max_discount) : null, minOrderAmount: Number(r.min_order_amount ?? 0), batchId: r.batch_id as string | null, profileId: r.profile_id as string | null, firstPurchaseOnly: r.first_purchase_only as boolean, autoApply: r.auto_apply as boolean, maxUses: r.max_uses !== null ? Number(r.max_uses) : null, usedCount: Number(r.used_count ?? 0), startsAt: r.starts_at as string | null, expiresAt: r.expires_at as string | null, isActive: r.is_active as boolean, createdBy: r.created_by as string | null, createdAt: r.created_at as string, updatedAt: r.updated_at as string }; }
}
export const couponService = new CouponService();
