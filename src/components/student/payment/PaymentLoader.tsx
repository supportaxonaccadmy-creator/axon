import { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface PaymentLoaderProps {
  message?: string | undefined;
}

function PaymentLoaderComponent({ message = 'Processing payment...' }: PaymentLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      <p className="text-sm text-neutral-600">{message}</p>
    </div>
  );
}

export const PaymentLoader = memo(PaymentLoaderComponent);
