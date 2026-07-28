import { memo } from 'react';
import { Link } from 'react-router-dom';
import { XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaymentFailureCardProps {
  error: string;
  onRetry?: (() => void) | undefined;
}

function PaymentFailureCardComponent({ error, onRetry }: PaymentFailureCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-error-200 bg-error-50 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
        <XCircle className="h-8 w-8 text-error-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Payment Failed</h2>
        <p className="mt-1 text-sm text-neutral-600">{error}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && <Button onClick={onRetry}><RotateCcw className="h-4 w-4" />Try Again</Button>}
        <Link to="/student/batches"><Button variant="outline"><ArrowLeft className="h-4 w-4" />Back to Batches</Button></Link>
      </div>
    </div>
  );
}

export const PaymentFailureCard = memo(PaymentFailureCardComponent);
