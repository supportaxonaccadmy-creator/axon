import type { Purchase, PaymentStatus } from '@/types/lms';

export function formatAmount(amount: number, currency: string = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] ?? currency + ' ';
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function isCompleted(purchase: Purchase): boolean {
  return purchase.paymentStatus === 'completed';
}

export function isPending(purchase: Purchase): boolean {
  return purchase.paymentStatus === 'pending';
}

export function isFailed(purchase: Purchase): boolean {
  return purchase.paymentStatus === 'failed';
}

export function isRefunded(purchase: Purchase): boolean {
  return purchase.paymentStatus === 'refunded';
}

export function formatPurchaseDate(purchase: Purchase): string {
  return new Date(purchase.purchasedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return labels[status] ?? status;
}
