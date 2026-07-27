import { memo } from 'react';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SortableRowProps {
  onMoveUp?: (() => void) | undefined;
  onMoveDown?: (() => void) | undefined;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  children: React.ReactNode;
  className?: string | undefined;
  draggable?: boolean;
  onDragStart?: ((e: React.DragEvent) => void) | undefined;
  onDragOver?: ((e: React.DragEvent) => void) | undefined;
  onDrop?: ((e: React.DragEvent) => void) | undefined;
  onDragEnd?: ((e: React.DragEvent) => void) | undefined;
}

function SortableRowComponent({
  onMoveUp, onMoveDown, canMoveUp = true, canMoveDown = true, children, className,
  draggable = false, onDragStart, onDragOver, onDrop, onDragEnd,
}: SortableRowProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} draggable={draggable} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}>
      <div className="flex shrink-0 flex-col gap-0.5">
        <button onClick={onMoveUp} disabled={!canMoveUp} className="text-neutral-400 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Move up" type="button"><ChevronUp className="h-4 w-4" /></button>
        <button onClick={onMoveDown} disabled={!canMoveDown} className="text-neutral-400 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Move down" type="button"><ChevronDown className="h-4 w-4" /></button>
      </div>
      {draggable && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-neutral-300" />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export const SortableRow = memo(SortableRowComponent);
