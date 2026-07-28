import { memo } from 'react';
import { formatCurrency } from '@/services/payment/paymentHelpers';
import type { CheckoutSummary } from '@/types/payment';

interface OrderSummaryProps {
  summary: CheckoutSummary;
  batchTitle: string;
}

function OrderSummaryComponent({ summary, batchTitle }: OrderSummaryProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-neutral-900">Order Summary</h3>
      <div className="mb-4 rounded-lg bg-neutral-50 p-3">
        <p className="text-sm font-medium text-neutral-900">{batchTitle}</p>
        <p className="text-xs text-neutral-500">{summary.isFree ? 'Free Course' : 'Paid Course'}</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm"><span className="text-neutral-500">Original Price</span><span className="text-neutral-900">{formatCurrency(summary.originalPrice, summary.currency)}</span></div>
        {summary.discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-500">Discount</span><span className="text-success-600">-{formatCurrency(summary.discountAmount, summary.currency)}</span></div>}
        {summary.couponDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-500">Coupon Discount</span><span className="text-success-600">-{formatCurrency(summary.couponDiscount, summary.currency)}</span></div>}
        {summary.gstAmount > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-500">GST</span><span className="text-neutral-900">{formatCurrency(summary.gstAmount, summary.currency)}</span></div>}
        <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold"><span className="text-neutral-900">Total</span><span className="text-primary-600">{formatCurrency(summary.finalAmount, summary.currency)}</span></div>
      </div>
    </div>
  );
}

export const OrderSummary = memo(OrderSummaryComponent);
