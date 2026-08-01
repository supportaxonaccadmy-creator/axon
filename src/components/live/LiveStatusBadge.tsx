import { memo } from 'react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { LiveClassStatus } from '@/services/live';
import { STATUS_LABELS, STATUS_VARIANT } from '@/services/live';

interface LiveStatusBadgeProps {
  status: LiveClassStatus;
  className?: string | undefined;
}

function LiveStatusBadgeComponent({ status, className }: LiveStatusBadgeProps) {
  const variant = STATUS_VARIANT[status];
  const label = STATUS_LABELS[status];
  const isLive = status === 'live';

  return (
    <Badge variant={variant} className={cn(isLive && 'animate-pulse', className)}>
      {isLive && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </Badge>
  );
}

export const LiveStatusBadge = memo(LiveStatusBadgeComponent);