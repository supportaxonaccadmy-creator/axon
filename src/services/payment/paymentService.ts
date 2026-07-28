import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { PAYMENT_GATEWAY_KEY, PAYMENT_ERRORS } from '@/constants/payment';
import { loadRazorpayScript, isRazorpayLoaded } from './paymentHelpers';
import { verifyRazorpaySignature } from './paymentVerification';
import type {
  CreateOrderRequest, CreateOrderResponse, RazorpayPaymentResponse,
  PaymentResult, VerifyPaymentRequest,
} from '@/types/payment';

export const razorpayService = {
  async createOrder(request: CreateOrderRequest): Promise<{ data: CreateOrderResponse | null; error: string | null }> {
    try {
      const orderId = `order_${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
      return {
        data: {
          orderId, amount: request.amount, currency: request.currency, key: PAYMENT_GATEWAY_KEY,
        },
        error: null,
      };
    } catch (err) {
      logger.error('razorpayService.createOrder', { error: err instanceof Error ? err.message : 'Unknown' });
      return { data: null, error: PAYMENT_ERRORS.ORDER_CREATION_FAILED };
    }
  },

  async openCheckout(options: {
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill: { name: string; email: string; contact: string };
    onSuccess: (response: RazorpayPaymentResponse) => void;
    onFailure: (error: { code: string; description: string }) => void;
    onDismiss: () => void;
  }): Promise<void> {
    try {
      await loadRazorpayScript();
      if (!isRazorpayLoaded()) { options.onFailure({ code: 'GATEWAY_NOT_LOADED', description: PAYMENT_ERRORS.RAZORPAY_NOT_LOADED }); return; }
      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: Record<string, unknown>) => { open: () => void } }).Razorpay;
      const rzp = new RazorpayConstructor({
        key: PAYMENT_GATEWAY_KEY,
        amount: options.amount * 100,
        currency: options.currency,
        order_id: options.orderId,
        name: options.name,
        description: options.description,
        prefill: options.prefill,
        theme: { color: '#3b82f6' },
        handler: (response: RazorpayPaymentResponse) => options.onSuccess(response),
        modal: { ondismiss: options.onDismiss },
      });
      rzp.open();
    } catch (err) {
      logger.error('razorpayService.openCheckout', { error: err instanceof Error ? err.message : 'Unknown' });
      options.onFailure({ code: 'CHECKOUT_ERROR', description: err instanceof Error ? err.message : 'Unknown error' });
    }
  },

  verifyPayment(request: VerifyPaymentRequest): boolean {
    return verifyRazorpaySignature(request.orderId, request.paymentId, request.signature, '');
  },
};

export const paymentService = {
  async checkExistingPurchase(profileId: string, batchId: string): Promise<{ hasPurchase: boolean; hasEnrollment: boolean }> {
    const supabase = getSupabaseClient();
    const { data: purchases } = await supabase.from('purchases')
      .select('id').eq('profile_id', profileId).eq('batch_id', batchId)
      .eq('payment_status', 'completed').maybeSingle();
    const { data: enrollments } = await supabase.from('enrollments')
      .select('id').eq('profile_id', profileId).eq('batch_id', batchId)
      .in('access_status', ['active']).maybeSingle();
    return { hasPurchase: !!purchases, hasEnrollment: !!enrollments };
  },

  async createPurchaseRecord(input: {
    profileId: string; batchId: string; pricingId: string;
    amount: number; currency: string; gateway: string; orderId: string;
  }): Promise<{ data: string | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('purchases').insert({
        profile_id: input.profileId, batch_id: input.batchId, pricing_id: input.pricingId,
        amount: input.amount, currency: input.currency, payment_status: 'pending',
        gateway: input.gateway, payment_order_id: input.orderId,
        purchased_at: new Date().toISOString(),
      }).select('id').maybeSingle();
      if (error) { logger.error('paymentService.createPurchaseRecord', { error: error.message }); return { data: null, error: error.message }; }
      return { data: (data as { id: string } | null)?.id ?? null, error: null };
    } catch (err) {
      logger.error('paymentService.createPurchaseRecord', { error: err instanceof Error ? err.message : 'Unknown' });
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async completePurchase(input: {
    purchaseId: string; paymentId: string; paymentMethod: string;
    transactionReference: string; webhookPayload?: Record<string, unknown> | undefined;
  }): Promise<{ data: { purchaseId: string; enrollmentId: string | null } | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: purchase } = await supabase.from('purchases')
        .select('*').eq('id', input.purchaseId).maybeSingle();
      if (!purchase) return { data: null, error: 'Purchase not found' };
      const purchaseRow = purchase as { profile_id: string; batch_id: string; pricing_id: string; amount: number; currency: string };
      const updateData: Record<string, unknown> = {
        payment_status: 'completed', payment_id: input.paymentId,
        payment_method: input.paymentMethod, transaction_reference: input.transactionReference,
        paid_at: new Date().toISOString(), refund_status: 'none',
      };
      if (input.webhookPayload) updateData.webhook_payload = input.webhookPayload;
      await supabase.from('purchases').update(updateData).eq('id', input.purchaseId);

      let enrollmentId: string | null = null;
      const { data: existingEnrollment } = await supabase.from('enrollments')
        .select('id').eq('profile_id', purchaseRow.profile_id).eq('batch_id', purchaseRow.batch_id)
        .maybeSingle();
      if (!existingEnrollment) {
        const { data: newEnrollment } = await supabase.from('enrollments').insert({
          profile_id: purchaseRow.profile_id, batch_id: purchaseRow.batch_id,
          enrollment_type: 'paid', access_status: 'active',
          enrolled_at: new Date().toISOString(),
        }).select('id').maybeSingle();
        enrollmentId = (newEnrollment as { id: string } | null)?.id ?? null;
      } else {
        enrollmentId = (existingEnrollment as { id: string }).id;
      }
      return { data: { purchaseId: input.purchaseId, enrollmentId }, error: null };
    } catch (err) {
      logger.error('paymentService.completePurchase', { error: err instanceof Error ? err.message : 'Unknown' });
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async failPurchase(input: {
    purchaseId: string; failureReason: string;
  }): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('purchases').update({
        payment_status: 'failed', failure_reason: input.failureReason,
      }).eq('id', input.purchaseId);
      return { error: null };
    } catch (err) {
      logger.error('paymentService.failPurchase', { error: err instanceof Error ? err.message : 'Unknown' });
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getPurchaseWithDetails(purchaseId: string): Promise<{ data: { id: string; profileId: string; batchId: string; batchTitle: string; amount: number; currency: string; paymentStatus: string; paymentMethod: string | null; transactionReference: string | null; gateway: string; paymentOrderId: string | null; paymentId: string | null; refundStatus: string; refundId: string | null; purchasedAt: string; paidAt: string | null; failureReason: string | null } | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('purchases')
        .select('*, batches(title)').eq('id', purchaseId).maybeSingle();
      if (error || !data) return { data: null, error: error?.message ?? 'Purchase not found' };
      const row = data as Record<string, unknown>;
      const batch = row.batches as Record<string, unknown> | null;
      return {
        data: {
          id: String(row.id), profileId: String(row.profile_id), batchId: String(row.batch_id),
          batchTitle: batch ? String(batch.title) : 'Unknown', amount: Number(row.amount),
          currency: String(row.currency), paymentStatus: String(row.payment_status),
          paymentMethod: (row.payment_method as string | null) ?? null,
          transactionReference: (row.transaction_reference as string | null) ?? null,
          gateway: String(row.gateway), paymentOrderId: (row.payment_order_id as string | null) ?? null,
          paymentId: (row.payment_id as string | null) ?? null,
          refundStatus: String(row.refund_status ?? 'none'), refundId: (row.refund_id as string | null) ?? null,
          purchasedAt: String(row.purchased_at), paidAt: (row.paid_at as string | null) ?? null,
          failureReason: (row.failure_reason as string | null) ?? null,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStudentPurchasesWithDetails(profileId: string): Promise<{ data: Array<{ id: string; batchId: string; batchTitle: string; amount: number; currency: string; paymentStatus: string; gateway: string; paymentMethod: string | null; transactionReference: string | null; refundStatus: string; purchasedAt: string; paidAt: string | null }> | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('purchases')
        .select('*, batches(title)').eq('profile_id', profileId)
        .order('purchased_at', { ascending: false });
      if (error) return { data: null, error: error.message };
      return {
        data: (data ?? []).map((row: Record<string, unknown>) => {
          const batch = row.batches as Record<string, unknown> | null;
          return {
            id: String(row.id), batchId: String(row.batch_id),
            batchTitle: batch ? String(batch.title) : 'Unknown',
            amount: Number(row.amount), currency: String(row.currency),
            paymentStatus: String(row.payment_status), gateway: String(row.gateway),
            paymentMethod: (row.payment_method as string | null) ?? null,
            transactionReference: (row.transaction_reference as string | null) ?? null,
            refundStatus: String(row.refund_status ?? 'none'),
            purchasedAt: String(row.purchased_at), paidAt: (row.paid_at as string | null) ?? null,
          };
        }),
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async requestRefund(purchaseId: string): Promise<{ data: { refundId: string } | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const refundId = `rfd_${Date.now()}`;
      await supabase.from('purchases').update({
        refund_status: 'pending', refund_id: refundId,
      }).eq('id', purchaseId);
      return { data: { refundId }, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async initiatePayment(input: {
    profileId: string; batchId: string; pricingId: string;
    amount: number; currency: string; batchTitle: string;
    studentName: string; studentEmail: string; studentMobile: string;
    onSuccess: (response: RazorpayPaymentResponse) => void;
    onFailure: (error: { code: string; description: string }) => void;
    onDismiss: () => void;
  }): Promise<{ data: { purchaseId: string; orderId: string } | null; error: string | null }> {
    try {
      const { hasPurchase, hasEnrollment } = await this.checkExistingPurchase(input.profileId, input.batchId);
      if (hasPurchase || hasEnrollment) return { data: null, error: PAYMENT_ERRORS.DUPLICATE_PURCHASE };

      const orderResult = await razorpayService.createOrder({
        batchId: input.batchId, pricingId: input.pricingId,
        amount: input.amount, currency: input.currency, profileId: input.profileId,
      });
      if (orderResult.error || !orderResult.data) return { data: null, error: orderResult.error ?? 'Order creation failed' };

      const purchaseResult = await this.createPurchaseRecord({
        profileId: input.profileId, batchId: input.batchId, pricingId: input.pricingId,
        amount: input.amount, currency: input.currency, gateway: 'razorpay', orderId: orderResult.data.orderId,
      });
      if (purchaseResult.error || !purchaseResult.data) return { data: null, error: purchaseResult.error ?? 'Failed to create purchase' };
      const purchaseId = purchaseResult.data;

      await razorpayService.openCheckout({
        orderId: orderResult.data.orderId, amount: orderResult.data.amount, currency: orderResult.data.currency,
        name: 'Axon Nursing Academy', description: input.batchTitle,
        prefill: { name: input.studentName, email: input.studentEmail, contact: input.studentMobile },
        onSuccess: input.onSuccess, onFailure: input.onFailure, onDismiss: input.onDismiss,
      });

      return { data: { purchaseId, orderId: orderResult.data.orderId }, error: null };
    } catch (err) {
      logger.error('paymentService.initiatePayment', { error: err instanceof Error ? err.message : 'Unknown' });
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async verifyAndComplete(input: {
    purchaseId: string; razorpayResponse: RazorpayPaymentResponse;
  }): Promise<PaymentResult> {
    try {
      const isValid = razorpayService.verifyPayment({
        orderId: input.razorpayResponse.razorpay_order_id,
        paymentId: input.razorpayResponse.razorpay_payment_id,
        signature: input.razorpayResponse.razorpay_signature,
        purchaseId: input.purchaseId,
      });
      if (!isValid) {
        await this.failPurchase({ purchaseId: input.purchaseId, failureReason: 'Signature verification failed' });
        return { success: false, purchaseId: input.purchaseId, enrollmentId: null, error: PAYMENT_ERRORS.VERIFICATION_FAILED, paymentId: input.razorpayResponse.razorpay_payment_id, orderId: input.razorpayResponse.razorpay_order_id };
      }
      const completeResult = await this.completePurchase({
        purchaseId: input.purchaseId, paymentId: input.razorpayResponse.razorpay_payment_id,
        paymentMethod: 'razorpay', transactionReference: input.razorpayResponse.razorpay_payment_id,
      });
      if (completeResult.error || !completeResult.data) return { success: false, purchaseId: input.purchaseId, enrollmentId: null, error: completeResult.error ?? 'Failed to complete purchase', paymentId: input.razorpayResponse.razorpay_payment_id, orderId: input.razorpayResponse.razorpay_order_id };
      return { success: true, purchaseId: completeResult.data.purchaseId, enrollmentId: completeResult.data.enrollmentId, error: null, paymentId: input.razorpayResponse.razorpay_payment_id, orderId: input.razorpayResponse.razorpay_order_id };
    } catch (err) {
      return { success: false, purchaseId: input.purchaseId, enrollmentId: null, error: err instanceof Error ? err.message : 'Unknown error', paymentId: null, orderId: null };
    }
  },
};
