export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentGateway = 'razorpay' | 'stripe' | 'cashfree' | 'phonepe' | 'manual';

export interface Purchase {
  id: string;
  profileId: string;
  batchId: string;
  pricingId: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  transactionReference: string | null;
  gateway: string;
  purchasedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseInsert {
  profileId: string;
  batchId: string;
  pricingId: string;
  amount: number;
  currency?: string | undefined;
  paymentStatus?: PaymentStatus | undefined;
  paymentMethod?: string | null | undefined;
  transactionReference?: string | null | undefined;
  gateway?: string | undefined;
  purchasedAt?: string | undefined;
}

export interface PurchaseUpdate {
  profileId?: string | undefined;
  batchId?: string | undefined;
  pricingId?: string | undefined;
  amount?: number | undefined;
  currency?: string | undefined;
  paymentStatus?: PaymentStatus | undefined;
  paymentMethod?: string | null | undefined;
  transactionReference?: string | null | undefined;
  gateway?: string | undefined;
  purchasedAt?: string | undefined;
}

export interface PurchaseRow {
  id: string;
  profile_id: string;
  batch_id: string;
  pricing_id: string;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method: string | null;
  transaction_reference: string | null;
  gateway: string;
  purchased_at: string;
  created_at: string;
  updated_at: string;
}
