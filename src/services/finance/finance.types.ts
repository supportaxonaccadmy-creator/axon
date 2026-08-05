export type GatewayType = 'razorpay' | 'stripe' | 'cashfree' | 'phonepe' | 'manual';
export type CouponDiscountType = 'flat' | 'percentage';
export type RefundType = 'full' | 'partial' | 'wallet';
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type WalletTxType = 'credit' | 'debit';
export type PaymentOrderStatus = 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled';
export type InvoiceStatus = 'generated' | 'sent' | 'paid' | 'void';

export interface PaymentOrder {
  id: string;
  profileId: string;
  batchId: string;
  pricingId: string;
  gateway: GatewayType;
  gatewayOrderId: string | null;
  amount: number;
  currency: string;
  couponCode: string | null;
  couponDiscount: number;
  taxAmount: number;
  finalAmount: number;
  status: PaymentOrderStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string | null;
  purchaseId: string | null;
  profileId: string;
  gateway: GatewayType;
  gatewayPaymentId: string | null;
  gatewaySignature: string | null;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  status: string;
  verified: boolean;
  idempotencyKey: string | null;
  rawResponse: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  profileId: string;
  purchaseId: string | null;
  batchId: string | null;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  studentAddress: string | null;
  studentGstin: string | null;
  batchTitle: string;
  originalAmount: number;
  discountAmount: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
  currency: string;
  gateway: GatewayType | null;
  transactionId: string | null;
  status: InvoiceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface Refund {
  id: string;
  purchaseId: string;
  profileId: string;
  refundType: RefundType;
  status: RefundStatus;
  amount: number;
  currency: string;
  reason: string | null;
  gateway: GatewayType | null;
  gatewayRefundId: string | null;
  processedBy: string | null;
  processedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface WalletAccount {
  id: string;
  profileId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  profileId: string;
  type: WalletTxType;
  amount: number;
  balanceAfter: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  batchId: string | null;
  profileId: string | null;
  firstPurchaseOnly: boolean;
  autoApply: boolean;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  profileId: string;
  purchaseId: string | null;
  orderId: string | null;
  discountAmount: number;
  createdAt: string;
}

export interface TaxSettings {
  id: string;
  taxName: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  isInclusive: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSettings {
  id: string;
  defaultCurrency: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  primaryGateway: GatewayType;
  enableWallet: boolean;
  enableCoupons: boolean;
  enableRefunds: boolean;
  autoEnrollOnPayment: boolean;
  autoRevokeOnRefund: boolean;
  successUrl: string | null;
  cancelUrl: string | null;
  webhookSecret: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLog {
  id: string;
  profileId: string | null;
  orderId: string | null;
  transactionId: string | null;
  action: string;
  gateway: GatewayType | null;
  message: string | null;
  level: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface GatewayWebhook {
  id: string;
  gateway: GatewayType;
  eventType: string;
  eventId: string | null;
  payload: Record<string, unknown>;
  signatureVerified: boolean;
  processed: boolean;
  processedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface FinanceDashboard {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  yearlyRevenue: number;
  totalPurchases: number;
  completedPurchases: number;
  pendingPurchases: number;
  failedPurchases: number;
  paymentSuccessRate: number;
  refundAmount: number;
  totalRefunds: number;
  couponsUsed: number;
  walletUsage: number;
  averageOrderValue: number;
  topSellingBatches: { batchId: string; title: string; sales: number; revenue: number }[];
  gatewayStats: { gateway: string; count: number; revenue: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface CouponValidationResult {
  valid: boolean;
  discountAmount: number;
  message: string;
  coupon: Coupon | null;
}

export interface CheckoutCalculation {
  originalPrice: number;
  couponDiscount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  finalAmount: number;
  currency: string;
}
