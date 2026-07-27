import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Copy, Trash2, Archive, RotateCcw, CheckCircle2, EyeOff } from 'lucide-react';
import type { LmsStatus } from '@/types/lms';

interface ContentActionMenuProps {
  id: string;
  basePath: string;
  status: LmsStatus;
  onDuplicate: (id: string) => void;
  onStatusChange: (id: string, status: LmsStatus) => void;
  onDelete: (id: string) => void;
}

function ContentActionMenuComponent({ id, basePath, status, onDuplicate, onStatusChange, onDelete }: ContentActionMenuProps) {
  return (
    <div className="flex items-center gap-1">
      <Link to={`${basePath}/${id}`} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="View" aria-label="View"><Eye className="h-3.5 w-3.5" /></Link>
      <Link to={`${basePath}/${id}/edit`} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Edit" aria-label="Edit"><Edit className="h-3.5 w-3.5" /></Link>
      <button onClick={() => onDuplicate(id)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Duplicate" aria-label="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
      {status === 'published' ? (
        <button onClick={() => onStatusChange(id, 'draft')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-warning-600" title="Unpublish" aria-label="Unpublish"><EyeOff className="h-3.5 w-3.5" /></button>
      ) : status === 'archived' ? (
        <button onClick={() => onStatusChange(id, 'draft')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-success-600" title="Restore" aria-label="Restore"><RotateCcw className="h-3.5 w-3.5" /></button>
      ) : (
        <button onClick={() => onStatusChange(id, 'published')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-success-600" title="Publish" aria-label="Publish"><CheckCircle2 className="h-3.5 w-3.5" /></button>
      )}
      {status !== 'archived' && (
        <button onClick={() => onStatusChange(id, 'archived')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-warning-600" title="Archive" aria-label="Archive"><Archive className="h-3.5 w-3.5" /></button>
      )}
      <button onClick={() => onDelete(id)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-error-600" title="Delete" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export const ContentActionMenu = memo(ContentActionMenuComponent);
