import type { PaymentStatus, PaymentGateway } from '@/types/lms';

export type ExtendedPaymentStatus = PaymentStatus | 'cancelled' | 'expired';
export type RefundStatus = 'none' | 'pending' | 'completed' | 'failed';

export interface CheckoutSummary {
  batchId: string;
  batchTitle: string;
  batchSlug: string;
  pricingId: string;
  originalPrice: number;
  salePrice: number;
  discountAmount: number;
  couponCode: string | null;
  couponDiscount: number;
  gstAmount: number;
  finalAmount: number;
  currency: string;
  isFree: boolean;
}

export interface CreateOrderRequest {
  batchId: string;
  pricingId: string;
  amount: number;
  currency: string;
  profileId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
  purchaseId: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  purchaseId: string;
  enrollmentId: string | null;
}

export interface PaymentResult {
  success: boolean;
  purchaseId: string | null;
  enrollmentId: string | null;
  error: string | null;
  paymentId: string | null;
  orderId: string | null;
}

export interface PurchaseWithDetails {
  id: string;
  profileId: string;
  batchId: string;
  batchTitle: string;
  pricingId: string;
  amount: number;
  currency: string;
  paymentStatus: ExtendedPaymentStatus;
  paymentMethod: string | null;
  transactionReference: string | null;
  gateway: string;
  paymentOrderId: string | null;
  paymentId: string | null;
  refundStatus: RefundStatus;
  refundId: string | null;
  purchasedAt: string;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  studentName: string;
  studentEmail: string;
  batchTitle: string;
  amount: number;
  currency: string;
  gateway: string;
  transactionId: string | null;
  paymentStatus: string;
  instituteName: string;
}

export interface CouponInfo {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
  expiresAt: string | null;
}

export type { PaymentStatus, PaymentGateway };
