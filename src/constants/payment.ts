import type { ExtendedPaymentStatus, RefundStatus } from '@/types/payment';

export const PAYMENT_GATEWAY_KEY = 'rzp_test_1DP5mmOlF5G5ag';

export const PAYMENT_STATUS_LABELS: Record<ExtendedPaymentStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const PAYMENT_STATUS_VARIANTS: Record<ExtendedPaymentStatus, 'success' | 'warning' | 'error' | 'default'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'default',
  cancelled: 'default',
  expired: 'error',
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  none: 'No Refund',
  pending: 'Refund Pending',
  completed: 'Refunded',
  failed: 'Refund Failed',
};

export const REFUND_STATUS_VARIANTS: Record<RefundStatus, 'success' | 'warning' | 'error' | 'default'> = {
  none: 'default',
  pending: 'warning',
  completed: 'success',
  failed: 'error',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Credit/Debit Card',
  upi: 'UPI',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  emi: 'EMI',
  paylater: 'Pay Later',
  cash: 'Cash',
  'bank-transfer': 'Bank Transfer',
  manual: 'Manual',
};

export const PAYMENT_ERRORS = {
  ORDER_CREATION_FAILED: 'Failed to create payment order. Please try again.',
  PAYMENT_CANCELLED: 'Payment was cancelled. You can try again anytime.',
  PAYMENT_FAILED: 'Payment failed. Please check your payment details and try again.',
  VERIFICATION_FAILED: 'Payment verification failed. Please contact support.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  TIMEOUT: 'Payment timed out. Please try again.',
  DUPLICATE_PURCHASE: 'You have already purchased this batch.',
  ALREADY_ENROLLED: 'You are already enrolled in this batch.',
  RAZORPAY_NOT_LOADED: 'Payment gateway could not be loaded. Please refresh and try again.',
} as const;

export const RAZORPAY_CHECKOUT_OPTIONS = {
  name: 'Axon Nursing Academy',
  description: 'Course Purchase',
  theme: { color: '#3b82f6' },
  retry: { enabled: true, max_count: 3 },
  timeout: 300,
  remember_payment: true,
} as const;

export const GST_RATE = 0;

export const INSTITUTE_INFO = {
  name: 'Axon Nursing Academy',
  address: 'Education City, India',
  email: 'support@axonacademy.in',
  phone: '+91 98765 43210',
} as const;
