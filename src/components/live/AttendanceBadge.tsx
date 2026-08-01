import { memo } from 'react';
import { cn } from '@/utils/cn';
import { ATTENDANCE_LABELS, ATTENDANCE_COLORS } from '@/services/live';
import type { AttendanceStatus } from '@/services/live';

interface AttendanceBadgeProps {
  status: AttendanceStatus;
  className?: string | undefined;
}

function AttendanceBadgeComponent({ status, className }: AttendanceBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', ATTENDANCE_COLORS[status], className)}>
      {ATTENDANCE_LABELS[status]}
    </span>
  );
}

export const AttendanceBadge = memo(AttendanceBadgeComponent);
