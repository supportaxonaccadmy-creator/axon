import { memo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { REFUND_STATUS_LABELS, REFUND_STATUS_VARIANTS } from '@/constants/payment';
import type { RefundStatus } from '@/types/payment';

interface RefundStatusCardProps {
  refundStatus: RefundStatus | string;
  refundId: string | null;
}

function RefundStatusCardComponent({ refundStatus, refundId }: RefundStatusCardProps) {
  const status = refundStatus as RefundStatus;
  if (status === 'none') return null;
  const label = REFUND_STATUS_LABELS[status] ?? refundStatus;
  const variant = REFUND_STATUS_VARIANTS[status] ?? 'default';
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium text-neutral-900">Refund Status</p>{refundId && <p className="text-xs text-neutral-500">Refund ID: {refundId}</p>}</div>
        <Badge variant={variant}>{label}</Badge>
      </div>
    </div>
  );
}

export const RefundStatusCard = memo(RefundStatusCardComponent);
