import { memo } from 'react';
import { cn } from '@/utils/cn';
import { CERTIFICATE_STATUS_LABELS, CERTIFICATE_STATUS_COLORS } from '@/services/gamification';
import type { CertificateStatus } from '@/services/gamification';

interface CertificateStatusBadgeProps {
  status: CertificateStatus;
  className?: string | undefined;
}

function CertificateStatusBadgeComponent({ status, className }: CertificateStatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', CERTIFICATE_STATUS_COLORS[status], className)}>
      {CERTIFICATE_STATUS_LABELS[status]}
    </span>
  );
}

export const CertificateStatusBadge = memo(CertificateStatusBadgeComponent);
