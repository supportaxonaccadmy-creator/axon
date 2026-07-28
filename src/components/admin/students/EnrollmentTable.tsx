import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { EnrollmentStatusBadge } from './StatusBadges';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import type { EnrollmentStatus } from '@/types/lms';

interface EnrollmentRow {
  id: string;
  profileId: string;
  batchId: string;
  enrollmentType: string;
  accessStatus: EnrollmentStatus;
  enrolledAt: string;
  expiresAt: string | null;
  studentName: string;
  studentEmail: string;
  batchTitle: string;
}

interface EnrollmentTableProps {
  enrollments: EnrollmentRow[];
  onActivate?: ((id: string) => void) | undefined;
  onExpire?: ((id: string) => void) | undefined;
  onCancel?: ((id: string) => void) | undefined;
  showStudent?: boolean | undefined;
}

function EnrollmentTableComponent({ enrollments, onActivate, onExpire, onCancel, showStudent = true }: EnrollmentTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
        {showStudent && <span className="flex-1 text-xs font-medium text-neutral-500">Student</span>}
        {!showStudent && <span className="flex-1 text-xs font-medium text-neutral-500">Batch</span>}
        {showStudent && <span className="hidden w-40 text-xs font-medium text-neutral-500 lg:block">Batch</span>}
        <span className="hidden w-24 text-xs font-medium text-neutral-500 lg:block">Type</span>
        <span className="hidden w-28 text-xs font-medium text-neutral-500 sm:block">Enrolled</span>
        <span className="hidden w-28 text-xs font-medium text-neutral-500 lg:block">Expires</span>
        <span className="w-20 text-xs font-medium text-neutral-500">Status</span>
        <span className="w-28 text-xs font-medium text-neutral-500">Actions</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {enrollments.map((e) => (
          <div key={e.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50')}>
            {showStudent ? (
              <Link to={`/admin/students/${e.profileId}`} className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-neutral-900">{e.studentName}</p><p className="truncate text-xs text-neutral-500">{e.studentEmail}</p></Link>
            ) : (
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900">{e.batchTitle}</span>
            )}
            {showStudent && <div className="hidden w-40 shrink-0 lg:block"><span className="truncate text-xs text-neutral-600">{e.batchTitle}</span></div>}
            <div className="hidden w-24 shrink-0 lg:block"><Badge variant="default" className="text-[10px]">{e.enrollmentType}</Badge></div>
            <div className="hidden w-28 shrink-0 text-xs text-neutral-600 sm:block">{format(new Date(e.enrolledAt), 'MMM d, yyyy')}</div>
            <div className="hidden w-28 shrink-0 text-xs text-neutral-600 lg:block">{e.expiresAt ? format(new Date(e.expiresAt), 'MMM d, yyyy') : '—'}</div>
            <div className="w-20 shrink-0"><EnrollmentStatusBadge status={e.accessStatus} /></div>
            <div className="flex w-28 shrink-0 items-center gap-1">
              {e.accessStatus !== 'active' && onActivate && <button onClick={() => onActivate(e.id)} className="rounded px-2 py-1 text-xs text-success-600 hover:bg-success-50" title="Activate">Activate</button>}
              {e.accessStatus !== 'expired' && onExpire && <button onClick={() => onExpire(e.id)} className="rounded px-2 py-1 text-xs text-warning-600 hover:bg-warning-50" title="Expire">Expire</button>}
              {e.accessStatus !== 'cancelled' && onCancel && <button onClick={() => onCancel(e.id)} className="rounded px-2 py-1 text-xs text-error-600 hover:bg-error-50" title="Cancel">Cancel</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const EnrollmentTable = memo(EnrollmentTableComponent);
