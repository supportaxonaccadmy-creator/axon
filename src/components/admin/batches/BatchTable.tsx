import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Layers } from 'lucide-react';
import { BatchStatusBadge } from './BatchStatusBadge';
import { BatchActionMenu } from './BatchActionMenu';
import { cn } from '@/utils/cn';
import type { BatchWithStats } from '@/hooks/useAdminBatches';
import type { LmsStatus } from '@/types/lms';

interface BatchTableProps {
  batches: BatchWithStats[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDuplicate: (batch: BatchWithStats) => void;
  onStatusChange: (id: string, status: LmsStatus) => void;
  onDelete: (id: string) => void;
}

function BatchTableComponent({ batches, selected, onToggleSelect, onToggleSelectAll, onDuplicate, onStatusChange, onDelete }: BatchTableProps) {
  const allSelected = useMemo(() => batches.length > 0 && selected.size === batches.length, [batches, selected]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 lg:flex lg:items-center lg:gap-4">
        <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" aria-label="Select all" />
        <span className="w-12 text-xs font-medium text-neutral-500">Thumb</span>
        <span className="flex-1 text-xs font-medium text-neutral-500">Title</span>
        <span className="w-20 text-xs font-medium text-neutral-500">Status</span>
        <span className="w-24 text-xs font-medium text-neutral-500">Price</span>
        <span className="w-16 text-xs font-medium text-neutral-500">Students</span>
        <span className="w-16 text-xs font-medium text-neutral-500">Purchases</span>
        <span className="w-20 text-xs font-medium text-neutral-500">Revenue</span>
        <span className="w-16 text-xs font-medium text-neutral-500">Subjects</span>
        <span className="w-16 text-xs font-medium text-neutral-500">Classes</span>
        <span className="w-24 text-xs font-medium text-neutral-500">Created</span>
        <span className="w-28 text-xs font-medium text-neutral-500">Actions</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {batches.map((batch) => (
          <div key={batch.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50', selected.has(batch.id) && 'bg-primary-50/50')}>
            <input type="checkbox" checked={selected.has(batch.id)} onChange={() => onToggleSelect(batch.id)} className="h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" aria-label={`Select ${batch.title}`} />
            <div className="hidden h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 lg:block">{batch.thumbnail ? <img src={batch.thumbnail} alt={batch.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-neutral-300"><Layers className="h-4 w-4" /></div>}</div>
            <div className="min-w-0 flex-1"><Link to={`/admin/batches/${batch.id}`} className="block"><p className="truncate text-sm font-semibold text-neutral-900 hover:text-primary-600">{batch.title}</p></Link><p className="truncate text-xs text-neutral-500">/{batch.slug}</p></div>
            <div className="hidden w-20 shrink-0 lg:block"><BatchStatusBadge status={batch.status} /></div>
            <div className="hidden w-24 shrink-0 text-sm font-medium text-neutral-900 lg:block">{batch.pricing?.isFree ? 'Free' : `₹${(batch.pricing?.salePrice ?? batch.pricing?.price ?? 0).toLocaleString('en-IN')}`}</div>
            <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{batch.enrollmentCount}</div>
            <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{batch.purchaseCount}</div>
            <div className="hidden w-20 shrink-0 text-sm font-medium text-neutral-900 lg:block">₹{batch.revenue.toLocaleString('en-IN')}</div>
            <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{batch.subjectCount}</div>
            <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{batch.classCount}</div>
            <div className="hidden w-24 shrink-0 text-xs text-neutral-500 lg:block">{format(new Date(batch.createdAt), 'MMM d, yyyy')}</div>
            <div className="flex w-28 shrink-0 justify-end"><BatchActionMenu batch={batch} onDuplicate={onDuplicate} onStatusChange={onStatusChange} onDelete={onDelete} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const BatchTable = memo(BatchTableComponent);
