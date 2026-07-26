import type { PaymentGateway, PaymentStatus } from '@/types/lms';

export interface PaymentInitRequest {
  profileId: string;
  batchId: string;
  pricingId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | undefined;
  returnUrl: string;
  notes?: Record<string, string> | undefined;
}

export interface PaymentInitResponse {
  gateway: PaymentGateway;
  orderId: string;
  paymentUrl: string | null;
  amount: number;
  currency: string;
  gatewaySpecific: Record<string, unknown>;
}

export interface PaymentVerifyRequest {
  gateway: PaymentGateway;
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentVerifyResponse {
  gateway: PaymentGateway;
  transactionReference: string;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  gatewaySpecific: Record<string, unknown>;
}

export interface PaymentRefundRequest {
  transactionReference: string;
  amount: number;
  reason?: string | undefined;
}

export interface PaymentRefundResponse {
  gateway: PaymentGateway;
  refundId: string;
  refundStatus: PaymentStatus;
  amount: number;
  gatewaySpecific: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly gateway: PaymentGateway;
  initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse>;
  verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse>;
  refundPayment(request: PaymentRefundRequest): Promise<PaymentRefundResponse>;
}

export interface PaymentProviderConfig {
  apiKey: string;
  apiSecret: string;
  webhookSecret?: string | undefined;
  testMode: boolean;
}

export type PaymentProviderFactory = (config: PaymentProviderConfig) => PaymentProvider;
