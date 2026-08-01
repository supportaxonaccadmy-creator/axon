import { memo } from 'react';
import { cn } from '@/utils/cn';
import { STATUS_LABELS, STATUS_DOT_COLORS } from '@/services/live';
import type { LiveClassStatus } from '@/services/live';

interface LiveStatusBadgeProps {
  status: LiveClassStatus;
  className?: string | undefined;
}

function LiveStatusBadgeComponent({ status, className }: LiveStatusBadgeProps) {
  const dotColor = STATUS_DOT_COLORS[status];
  const textColor: Record<LiveClassStatus, string> = {
    scheduled: 'text-blue-600',
    live: 'text-red-600',
    completed: 'text-green-600',
    cancelled: 'text-neutral-500',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', textColor[status], className)}>
      <span className={cn('h-2 w-2 rounded-full', dotColor)} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export const LiveStatusBadge = memo(LiveStatusBadgeComponent);
