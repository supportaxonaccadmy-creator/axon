import { memo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_VARIANTS } from '@/constants/payment';
import type { ExtendedPaymentStatus } from '@/types/payment';

interface PaymentStatusBadgeProps {
  status: ExtendedPaymentStatus | string;
}

function PaymentStatusBadgeComponent({ status }: PaymentStatusBadgeProps) {
  const label = PAYMENT_STATUS_LABELS[status as ExtendedPaymentStatus] ?? status;
  const variant = PAYMENT_STATUS_VARIANTS[status as ExtendedPaymentStatus] ?? 'default';
  return <Badge variant={variant}>{label}</Badge>;
}

export const PaymentStatusBadge = memo(PaymentStatusBadgeComponent);
