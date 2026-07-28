import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentSuccessCard } from '@/components/student/payment';
import type { PaymentResult } from '@/types/payment';

interface SuccessPageState {
  result?: PaymentResult | undefined;
  batchSlug?: string | undefined;
  amount?: number | undefined;
  currency?: string | undefined;
}

export function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as SuccessPageState;

  if (!state.result) {
    navigate('/student/purchases');
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <PaymentSuccessCard result={state.result} batchSlug={state.batchSlug} amount={state.amount} currency={state.currency} />
    </div>
  );
}
