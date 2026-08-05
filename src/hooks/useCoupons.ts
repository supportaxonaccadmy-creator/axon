import { useState, useCallback } from 'react';
import { couponService } from '@/services/finance';
import type { Coupon, CouponValidationResult } from '@/services/finance';

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async (activeOnly = false) => { setLoading(true); const data = await couponService.getCoupons(activeOnly); setCoupons(data); setLoading(false); }, []);
  const validateCoupon = useCallback(async (code: string, orderAmount: number, profileId: string, batchId?: string, isFirstPurchase?: boolean): Promise<CouponValidationResult> => { return couponService.validateCoupon(code, orderAmount, profileId, batchId, isFirstPurchase); }, []);
  const createCoupon = useCallback(async (params: Parameters<typeof couponService.createCoupon>[0]) => { return couponService.createCoupon(params); }, []);
  const deleteCoupon = useCallback(async (id: string) => { return couponService.deleteCoupon(id); }, []);
  return { coupons, loading, refresh, validateCoupon, createCoupon, deleteCoupon };
}
