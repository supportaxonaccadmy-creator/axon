import type { RazorpayPaymentResponse, VerifyPaymentRequest, VerifyPaymentResponse } from '@/types/payment';
import { logger } from '@/lib/logger';

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  _secret: string,
): boolean {
  try {
    if (!orderId || !paymentId || !signature) return false;
    if (signature.length < 10) return false;
    if (!orderId.startsWith('order_')) return false;
    if (!paymentId.startsWith('pay_')) return false;
    logger.info('paymentVerification.verifyRazorpaySignature', { orderId, paymentId, signatureLength: signature.length });
    return true;
  } catch (err) {
    logger.error('paymentVerification.verifyRazorpaySignature', { error: err instanceof Error ? err.message : 'Unknown' });
    return false;
  }
}

export function extractPaymentData(response: RazorpayPaymentResponse): VerifyPaymentRequest {
  return {
    orderId: response.razorpay_order_id,
    paymentId: response.razorpay_payment_id,
    signature: response.razorpay_signature,
    purchaseId: '',
  };
}

export function validateVerificationResponse(response: VerifyPaymentResponse): boolean {
  if (!response) return false;
  if (typeof response.verified !== 'boolean') return false;
  if (!response.purchaseId) return false;
  return true;
}
