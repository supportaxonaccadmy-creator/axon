import { memo } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { LmsStatus } from '@/types/lms';

interface StatusBadgeProps { status: LmsStatus; }

function StatusBadgeComponent({ status }: StatusBadgeProps) {
  const variant = status === 'published' ? 'success' : status === 'draft' ? 'warning' : status === 'archived' ? 'default' : 'default';
  return <Badge variant={variant} className="capitalize">{status}</Badge>;
}

export const StatusBadge = memo(StatusBadgeComponent);
