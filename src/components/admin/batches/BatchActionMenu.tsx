import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Copy, Trash2, Archive, RotateCcw, CheckCircle2, EyeOff, MoreVertical } from 'lucide-react';
import type { BatchWithStats } from '@/hooks/useAdminBatches';
import type { LmsStatus } from '@/types/lms';

interface BatchActionMenuProps {
  batch: BatchWithStats;
  onDuplicate: (batch: BatchWithStats) => void;
  onStatusChange: (id: string, status: LmsStatus) => void;
  onDelete: (id: string) => void;
}

function BatchActionMenuComponent({ batch, onDuplicate, onStatusChange, onDelete }: BatchActionMenuProps) {
  return (
    <div className="flex items-center gap-1">
      <Link to={`/admin/batches/${batch.id}`} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="View" aria-label="View batch"><Eye className="h-3.5 w-3.5" /></Link>
      <Link to={`/admin/batches/${batch.id}/edit`} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Edit" aria-label="Edit batch"><Edit className="h-3.5 w-3.5" /></Link>
      <button onClick={() => onDuplicate(batch)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Duplicate" aria-label="Duplicate batch"><Copy className="h-3.5 w-3.5" /></button>
      {batch.status === 'published' ? (
        <button onClick={() => onStatusChange(batch.id, 'draft')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-warning-600" title="Unpublish" aria-label="Unpublish batch"><EyeOff className="h-3.5 w-3.5" /></button>
      ) : batch.status === 'archived' ? (
        <button onClick={() => onStatusChange(batch.id, 'draft')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-success-600" title="Restore" aria-label="Restore batch"><RotateCcw className="h-3.5 w-3.5" /></button>
      ) : (
        <button onClick={() => onStatusChange(batch.id, 'published')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-success-600" title="Publish" aria-label="Publish batch"><CheckCircle2 className="h-3.5 w-3.5" /></button>
      )}
      {batch.status !== 'archived' && (
        <button onClick={() => onStatusChange(batch.id, 'archived')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-warning-600" title="Archive" aria-label="Archive batch"><Archive className="h-3.5 w-3.5" /></button>
      )}
      <button onClick={() => onDelete(batch.id)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-error-600" title="Delete" aria-label="Delete batch"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export const BatchActionMenu = memo(BatchActionMenuComponent);
export { MoreVertical };
