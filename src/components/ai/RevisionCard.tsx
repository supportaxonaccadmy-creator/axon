import { memo } from 'react';
import { RotateCw, Calendar, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
import type { RevisionItem } from '@/services/ai';

interface RevisionCardProps {
  item: RevisionItem;
  onRevise?: ((id: string, confidence: number) => void | undefined) | undefined;
  onComplete?: ((id: string) => void | undefined) | undefined;
  className?: string | undefined;
}

function RevisionCardComponent({ item, onRevise, onComplete, className }: RevisionCardProps) {
  const isOverdue = new Date(item.nextRevisionDate) <= new Date();
  return (
    <Card hover className={cn(isOverdue && 'border-orange-200', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', isOverdue ? 'bg-orange-50' : 'bg-blue-50')}>
            <RotateCw className={cn('h-4 w-4', isOverdue ? 'text-orange-500' : 'text-blue-500')} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-neutral-900">{item.topicName}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(item.nextRevisionDate)}</span>
              <span>Revision #{item.revisionCount + 1}</span>
              <span>Confidence: {(item.confidenceScore * 100).toFixed(0)}%</span>
            </div>
            {isOverdue && <p className="mt-1 text-xs font-medium text-orange-600">Due for revision</p>}
            <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-2">
              {onRevise && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onRevise(item.id, 0.8)}>Revise</Button>
                  <button onClick={() => onRevise?.(item.id, 0.3)} className="rounded-md px-2 py-1 text-xs text-orange-600 hover:bg-orange-50">Need more practice</button>
                </>
              )}
              {onComplete && (
                <button onClick={() => onComplete(item.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-green-600 hover:bg-green-50">
                  <Check className="h-3 w-3" /> Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const RevisionCard = memo(RevisionCardComponent);
