import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import { Archive, CheckCircle2, EyeOff, Trash2, RotateCcw } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onClear: () => void;
}

function BulkActionBarComponent({ selectedCount, onPublish, onUnpublish, onArchive, onRestore, onDelete, onClear }: BulkActionBarProps) {
  if (selectedCount === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 animate-fade-in">
      <span className="text-sm font-medium text-primary-700">{selectedCount} selected</span>
      <div className="flex-1" />
      <Button size="sm" variant="outline" onClick={onPublish} title="Publish selected"><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>
      <Button size="sm" variant="outline" onClick={onUnpublish} title="Unpublish selected"><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
      <Button size="sm" variant="outline" onClick={onArchive} title="Archive selected"><Archive className="h-3.5 w-3.5" />Archive</Button>
      <Button size="sm" variant="outline" onClick={onRestore} title="Restore selected"><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
      <Button size="sm" variant="danger" onClick={onDelete} title="Delete selected"><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      <Button size="sm" variant="ghost" onClick={onClear}>Clear</Button>
    </div>
  );
}

export const BulkActionBar = memo(BulkActionBarComponent);
