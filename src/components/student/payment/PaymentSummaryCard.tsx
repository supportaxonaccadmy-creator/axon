import { memo } from 'react';
import { formatCurrency } from '@/services/payment/paymentHelpers';
import type { CheckoutSummary } from '@/types/payment';

interface PaymentSummaryCardProps {
  summary: CheckoutSummary;
}

function PaymentSummaryCardComponent({ summary }: PaymentSummaryCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-neutral-900">Payment Summary</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Original Price</span>
          <span className="text-sm text-neutral-900 line-through">{formatCurrency(summary.originalPrice, summary.currency)}</span>
        </div>
        {summary.discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Discount</span>
            <span className="text-sm font-medium text-success-600">-{formatCurrency(summary.discountAmount, summary.currency)}</span>
          </div>
        )}
        {summary.couponDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Coupon ({summary.couponCode})</span>
            <span className="text-sm font-medium text-success-600">-{formatCurrency(summary.couponDiscount, summary.currency)}</span>
          </div>
        )}
        {summary.gstAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">GST</span>
            <span className="text-sm text-neutral-900">{formatCurrency(summary.gstAmount, summary.currency)}</span>
          </div>
        )}
        <div className="border-t border-neutral-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-900">Total Payable</span>
            <span className="text-xl font-bold text-primary-600">{formatCurrency(summary.finalAmount, summary.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PaymentSummaryCard = memo(PaymentSummaryCardComponent);
