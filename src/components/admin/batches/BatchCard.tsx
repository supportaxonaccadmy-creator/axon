import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Users, ShoppingCart, IndianRupee, BookOpen, Video } from 'lucide-react';
import { BatchStatusBadge } from './BatchStatusBadge';
import { BatchActionMenu } from './BatchActionMenu';
import { cn } from '@/utils/cn';
import type { BatchWithStats } from '@/hooks/useAdminBatches';
import type { LmsStatus } from '@/types/lms';

interface BatchCardProps {
  batch: BatchWithStats;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onDuplicate: (batch: BatchWithStats) => void;
  onStatusChange: (id: string, status: LmsStatus) => void;
  onDelete: (id: string) => void;
}

function BatchCardComponent({ batch, selected, onToggleSelect, onDuplicate, onStatusChange, onDelete }: BatchCardProps) {
  const formattedDate = useMemo(() => format(new Date(batch.createdAt), 'MMM d, yyyy'), [batch.createdAt]);
  const discountPct = useMemo(() => {
    if (!batch.pricing || batch.pricing.isFree) return null;
    if (batch.pricing.salePrice !== null && batch.pricing.price > 0) {
      return Math.round(((batch.pricing.price - batch.pricing.salePrice) / batch.pricing.price) * 100);
    }
    return null;
  }, [batch.pricing]);

  return (
    <div className={cn('rounded-xl border bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md', selected ? 'border-primary-300 bg-primary-50/30' : 'border-neutral-200')}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(batch.id)} className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" aria-label={`Select ${batch.title}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/admin/batches/${batch.id}`} className="block"><h3 className="truncate text-sm font-semibold text-neutral-900 hover:text-primary-600">{batch.title}</h3></Link>
              <p className="truncate text-xs text-neutral-500">/{batch.slug}</p>
            </div>
            <BatchStatusBadge status={batch.status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-600">{batch.enrollmentCount}</span></div>
            <div className="flex items-center gap-1.5"><ShoppingCart className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-600">{batch.purchaseCount}</span></div>
            <div className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-600">{batch.subjectCount}</span></div>
            <div className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-600">{batch.classCount}</span></div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {batch.pricing?.isFree ? (
                <span className="text-sm font-bold text-success-600">Free</span>
              ) : batch.pricing?.salePrice !== null && batch.pricing?.salePrice !== undefined ? (
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center text-sm font-bold text-neutral-900"><IndianRupee className="h-3 w-3" />{batch.pricing.salePrice.toLocaleString('en-IN')}</span>
                  {discountPct && <span className="rounded bg-success-100 px-1.5 py-0.5 text-[10px] font-medium text-success-700">{discountPct}% off</span>}
                </div>
              ) : batch.pricing ? (
                <span className="flex items-center text-sm font-bold text-neutral-900"><IndianRupee className="h-3 w-3" />{batch.pricing.price.toLocaleString('en-IN')}</span>
              ) : (
                <span className="text-xs text-neutral-400">No pricing</span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400">{formattedDate}</span>
          </div>
          <div className="mt-3 border-t border-neutral-100 pt-2"><BatchActionMenu batch={batch} onDuplicate={onDuplicate} onStatusChange={onStatusChange} onDelete={onDelete} /></div>
        </div>
      </div>
    </div>
  );
}

export const BatchCard = memo(BatchCardComponent);
