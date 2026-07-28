import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentFailureCard } from '@/components/student/payment';

interface FailurePageState {
  error?: string | undefined;
  batchSlug?: string | undefined;
}

export function PaymentFailurePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as FailurePageState;

  const handleRetry = () => {
    if (state.batchSlug) navigate(`/student/checkout/${state.batchSlug}`);
    else navigate('/student/batches');
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <PaymentFailureCard error={state.error ?? 'Payment could not be completed. Please try again.'} onRetry={handleRetry} />
    </div>
  );
}
