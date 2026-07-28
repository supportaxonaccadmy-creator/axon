import { useState, useCallback, useMemo } from 'react';
import { paymentService } from '@/services/payment/paymentService';
import { calculateCheckout } from '@/services/payment/paymentHelpers';
import { PAYMENT_ERRORS } from '@/constants/payment';
import { logger } from '@/lib/logger';
import type {
  CheckoutSummary, PaymentResult, RazorpayPaymentResponse, CouponInfo,
} from '@/types/payment';

interface UsePaymentParams {
  profileId: string;
  batchId: string;
  batchTitle: string;
  batchSlug: string;
  pricingId: string;
  originalPrice: number;
  salePrice: number | null;
  currency: string;
  isFree: boolean;
  studentName: string;
  studentEmail: string;
  studentMobile: string;
}

export function usePayment(params: UsePaymentParams) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const checkoutSummary: CheckoutSummary = useMemo(() => {
    const summary = calculateCheckout({
      originalPrice: params.originalPrice,
      salePrice: params.salePrice,
      couponCode: appliedCoupon ? couponCode : null,
      couponInfo: appliedCoupon,
      currency: params.currency,
      isFree: params.isFree,
    });
    return {
      ...summary,
      batchId: params.batchId, batchTitle: params.batchTitle, batchSlug: params.batchSlug, pricingId: params.pricingId,
    };
  }, [params.originalPrice, params.salePrice, params.currency, params.isFree, appliedCoupon, couponCode, params.batchId, params.batchTitle, params.batchSlug, params.pricingId]);

  const applyCoupon = useCallback((code: string, couponInfo: CouponInfo | null) => {
    setCouponCode(code);
    setAppliedCoupon(couponInfo);
    setError(null);
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode('');
    setAppliedCoupon(null);
  }, []);

  const startPayment = useCallback(async (callbacks: {
    onSuccess: (result: PaymentResult) => void;
    onFailure: (error: string) => void;
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    setPaymentResult(null);

    if (params.isFree || checkoutSummary.finalAmount === 0) {
      try {
        const { data, error: createError } = await paymentService.createPurchaseRecord({
          profileId: params.profileId, batchId: params.batchId, pricingId: params.pricingId,
          amount: 0, currency: params.currency, gateway: 'manual', orderId: `free_${Date.now()}`,
        });
        if (createError || !data) { setError(createError ?? 'Failed to create purchase'); setLoading(false); callbacks.onFailure(createError ?? 'Failed'); return; }
        const { data: completeData, error: completeError } = await paymentService.completePurchase({
          purchaseId: data, paymentId: `free_${data}`, paymentMethod: 'free', transactionReference: `free_${data}`,
        });
        if (completeError) { setError(completeError); setLoading(false); callbacks.onFailure(completeError); return; }
        const result: PaymentResult = { success: true, purchaseId: data, enrollmentId: completeData?.enrollmentId ?? null, error: null, paymentId: `free_${data}`, orderId: `free_${data}` };
        setPaymentResult(result);
        setLoading(false);
        callbacks.onSuccess(result);
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg); setLoading(false); callbacks.onFailure(msg); return;
      }
    }

    const handleRazorpaySuccess = async (response: RazorpayPaymentResponse) => {
      setLoading(true);
      try {
        const result = await paymentService.verifyAndComplete({
          purchaseId: currentPurchaseId,
          razorpayResponse: response,
        });
        setPaymentResult(result);
        setLoading(false);
        if (result.success) callbacks.onSuccess(result);
        else { setError(result.error ?? PAYMENT_ERRORS.VERIFICATION_FAILED); callbacks.onFailure(result.error ?? PAYMENT_ERRORS.VERIFICATION_FAILED); }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg); setLoading(false); callbacks.onFailure(msg);
      }
    };

    const handleRazorpayFailure = (err: { code: string; description: string }) => {
      logger.error('usePayment.handleRazorpayFailure', { code: err.code, description: err.description });
      let msg = err.description;
      if (err.code === 'GATEWAY_NOT_LOADED') msg = PAYMENT_ERRORS.RAZORPAY_NOT_LOADED;
      setError(msg); setLoading(false); callbacks.onFailure(msg);
    };

    const handleRazorpayDismiss = () => {
      setError(PAYMENT_ERRORS.PAYMENT_CANCELLED); setLoading(false);
    };

    let currentPurchaseId = '';
    try {
      const result = await paymentService.initiatePayment({
        profileId: params.profileId, batchId: params.batchId, pricingId: params.pricingId,
        amount: checkoutSummary.finalAmount, currency: params.currency, batchTitle: params.batchTitle,
        studentName: params.studentName, studentEmail: params.studentEmail, studentMobile: params.studentMobile,
        onSuccess: handleRazorpaySuccess, onFailure: handleRazorpayFailure, onDismiss: handleRazorpayDismiss,
      });
      if (result.error) { setError(result.error); setLoading(false); callbacks.onFailure(result.error); return; }
      if (result.data) currentPurchaseId = result.data.purchaseId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg); setLoading(false); callbacks.onFailure(msg);
    }
  }, [params, checkoutSummary]);

  const retryPayment = useCallback(async (callbacks: {
    onSuccess: (result: PaymentResult) => void;
    onFailure: (error: string) => void;
  }): Promise<void> => {
    setError(null);
    await startPayment(callbacks);
  }, [startPayment]);

  const reset = useCallback(() => {
    setLoading(false); setError(null); setPaymentResult(null);
  }, []);

  return {
    loading, error, couponCode, appliedCoupon, checkoutSummary, paymentResult,
    applyCoupon, removeCoupon, startPayment, retryPayment, reset,
  };
}
