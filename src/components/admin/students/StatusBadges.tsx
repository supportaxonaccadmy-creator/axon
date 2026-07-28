import { memo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import type { EnrollmentStatus } from '@/types/lms';

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
}

const config: Record<EnrollmentStatus, { variant: 'success' | 'warning' | 'default'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  expired: { variant: 'warning', label: 'Expired' },
  cancelled: { variant: 'default', label: 'Cancelled' },
};

function EnrollmentStatusBadgeComponent({ status }: EnrollmentStatusBadgeProps) {
  const c = config[status] ?? config.active;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export const EnrollmentStatusBadge = memo(EnrollmentStatusBadgeComponent);

interface PurchaseStatusBadgeProps {
  status: string;
}

const purchaseConfig: Record<string, { variant: 'success' | 'warning' | 'default' | 'error'; label: string }> = {
  completed: { variant: 'success', label: 'Completed' },
  pending: { variant: 'warning', label: 'Pending' },
  failed: { variant: 'error', label: 'Failed' },
  refunded: { variant: 'default', label: 'Refunded' },
};

function PurchaseStatusBadgeComponent({ status }: PurchaseStatusBadgeProps) {
  const c = purchaseConfig[status] ?? purchaseConfig.pending;
  return <Badge variant={c!.variant}>{c!.label}</Badge>;
}

export const PurchaseStatusBadge = memo(PurchaseStatusBadgeComponent);

interface ProgressCardProps {
  label: string;
  value: number;
  max: number;
  className?: string | undefined;
}

function ProgressCardComponent({ label, value, max, className }: ProgressCardProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={cn('rounded-lg border border-neutral-200 bg-white p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">{label}</span><span className="text-sm font-semibold text-neutral-900">{pct}%</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${pct}%` }} /></div>
      <p className="mt-1 text-xs text-neutral-400">{value} / {max}</p>
    </div>
  );
}

export const ProgressCard = memo(ProgressCardComponent);
