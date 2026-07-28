import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PurchaseStatusBadge } from './StatusBadges';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

interface PurchaseRow {
  id: string;
  profileId: string;
  batchId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string | null;
  transactionReference: string | null;
  gateway: string;
  purchasedAt: string;
  studentName: string;
  studentEmail: string;
  batchTitle: string;
}

interface PurchaseTableProps {
  purchases: PurchaseRow[];
  onView?: ((id: string) => void) | undefined;
  onRefund?: ((id: string) => void) | undefined;
  showStudent?: boolean | undefined;
}

function PurchaseTableComponent({ purchases, onView, onRefund, showStudent = true }: PurchaseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
        {showStudent && <span className="flex-1 text-xs font-medium text-neutral-500">Student</span>}
        {!showStudent && <span className="flex-1 text-xs font-medium text-neutral-500">Batch</span>}
        {showStudent && <span className="hidden w-40 text-xs font-medium text-neutral-500 lg:block">Batch</span>}
        <span className="hidden w-20 text-xs font-medium text-neutral-500 lg:block">Gateway</span>
        <span className="hidden w-20 text-xs font-medium text-neutral-500 lg:block">Amount</span>
        <span className="hidden w-28 text-xs font-medium text-neutral-500 sm:block">Date</span>
        <span className="w-20 text-xs font-medium text-neutral-500">Status</span>
        <span className="w-24 text-xs font-medium text-neutral-500">Actions</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {purchases.map((p) => (
          <div key={p.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50')}>
            {showStudent ? (
              <Link to={`/admin/students/${p.profileId}`} className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-neutral-900">{p.studentName}</p><p className="truncate text-xs text-neutral-500">{p.studentEmail}</p></Link>
            ) : (
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900">{p.batchTitle}</span>
            )}
            {showStudent && <div className="hidden w-40 shrink-0 lg:block"><span className="truncate text-xs text-neutral-600">{p.batchTitle}</span></div>}
            <div className="hidden w-20 shrink-0 lg:block"><span className="text-xs text-neutral-600">{p.gateway}</span></div>
            <div className="hidden w-20 shrink-0 lg:block"><span className="text-sm font-medium text-neutral-900">₹{p.amount.toLocaleString()}</span></div>
            <div className="hidden w-28 shrink-0 text-xs text-neutral-600 sm:block">{format(new Date(p.purchasedAt), 'MMM d, yyyy')}</div>
            <div className="w-20 shrink-0"><PurchaseStatusBadge status={p.paymentStatus} /></div>
            <div className="flex w-24 shrink-0 items-center gap-1">
              {onView && <button onClick={() => onView(p.id)} className="rounded px-2 py-1 text-xs text-primary-600 hover:bg-primary-50" title="View">View</button>}
              {p.paymentStatus === 'completed' && onRefund && <button onClick={() => onRefund(p.id)} className="rounded px-2 py-1 text-xs text-error-600 hover:bg-error-50" title="Refund">Refund</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const PurchaseTable = memo(PurchaseTableComponent);
