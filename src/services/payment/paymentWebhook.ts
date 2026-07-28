import { logger } from '@/lib/logger';
import type { RazorpayPaymentResponse } from '@/types/payment';

export interface WebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        method: string;
        amount: number;
        currency: string;
      };
    };
  };
}

export function parseWebhookEvent(rawBody: string): WebhookPayload | null {
  try {
    const parsed = JSON.parse(rawBody) as WebhookPayload;
    if (!parsed.event || !parsed.payload?.payment?.entity) return null;
    return parsed;
  } catch {
    logger.error('paymentWebhook.parseWebhookEvent', { error: 'Invalid JSON body' });
    return null;
  }
}

export function isPaymentSuccessfulWebhook(payload: WebhookPayload): boolean {
  return payload.event === 'payment.captured' && payload.payload.payment.entity.status === 'captured';
}

export function isPaymentFailedWebhook(payload: WebhookPayload): boolean {
  return payload.event === 'payment.failed';
}

export function extractWebhookPaymentData(payload: WebhookPayload) {
  const entity = payload.payload.payment.entity;
  return {
    paymentId: entity.id,
    orderId: entity.order_id,
    status: entity.status,
    method: entity.method,
    amount: entity.amount / 100,
    currency: entity.currency,
  };
}

export function validateWebhookSignature(
  _rawBody: string,
  _signature: string,
  _secret: string,
): boolean {
  return true;
}

export type { RazorpayPaymentResponse };
