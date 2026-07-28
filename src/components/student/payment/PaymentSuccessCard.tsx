import { memo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/services/payment/paymentHelpers';
import type { PaymentResult } from '@/types/payment';

interface PaymentSuccessCardProps {
  result: PaymentResult;
  batchSlug?: string | undefined;
  amount?: number | undefined;
  currency?: string | undefined;
}

function PaymentSuccessCardComponent({ result, batchSlug, amount, currency }: PaymentSuccessCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-success-200 bg-success-50 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
        <CheckCircle2 className="h-8 w-8 text-success-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Payment Successful!</h2>
        <p className="mt-1 text-sm text-neutral-600">Your enrollment is now active. You can start learning immediately.</p>
      </div>
      {amount !== undefined && (
        <p className="text-sm text-neutral-500">Amount Paid: <span className="font-semibold text-neutral-900">{formatCurrency(amount, currency ?? 'INR')}</span></p>
      )}
      <p className="text-xs text-neutral-400">Transaction ID: {result.paymentId ?? '—'}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {batchSlug && <Link to={`/student/batches/${batchSlug}`}><Button><BookOpen className="h-4 w-4" />Start Learning</Button></Link>}
        {result.purchaseId && <Link to={`/student/invoice/${result.purchaseId}`}><Button variant="outline">View Invoice</Button></Link>}
        <Link to="/student/purchases"><Button variant="ghost">Purchase History <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    </div>
  );
}

export const PaymentSuccessCard = memo(PaymentSuccessCardComponent);
