import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Lock, Clock, CheckCircle2, PlayCircle, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { Batch } from '@/types/lms';

export type BatchAccessStatus = 'purchased' | 'free' | 'locked';

interface StudentBatchListCardProps {
  batch: Batch;
  accessStatus: BatchAccessStatus;
  progress?: number;
}

function StudentBatchListCardComponent({ batch, accessStatus, progress = 0 }: StudentBatchListCardProps) {
  const isLocked = accessStatus === 'locked';
  const isPurchased = accessStatus === 'purchased';
  const isFree = accessStatus === 'free';
  return (
    <div className={cn('group relative flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm transition-all duration-150', isLocked ? 'border-neutral-200 opacity-75' : 'border-neutral-200 hover:shadow-md hover:border-primary-200 cursor-pointer')}>
      <div className="flex items-start justify-between">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', isLocked ? 'bg-neutral-100' : 'bg-primary-50')}>
          {isLocked ? <Lock className="h-6 w-6 text-neutral-400" /> : <Layers className="h-6 w-6 text-primary-600" strokeWidth={2} />}
        </div>
        <div className="flex flex-col items-end gap-1">
          {isPurchased && <Badge variant="success">Enrolled</Badge>}
          {isFree && <Badge variant="primary">Free</Badge>}
          {isLocked && <Badge variant="default">Locked</Badge>}
        </div>
      </div>
      {isLocked ? (
        <div><p className="text-sm font-semibold text-neutral-700">{batch.title}</p>{batch.description && <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{batch.description}</p>}</div>
      ) : (
        <Link to={`/student/batches/${batch.slug}`}><p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">{batch.title}</p>{batch.description && <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{batch.description}</p>}</Link>
      )}
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-neutral-500"><BookOpen className="h-3.5 w-3.5" />Subjects</span>
        {isPurchased && progress > 0 && <span className="flex items-center gap-1 font-medium text-primary-600"><CheckCircle2 className="h-3.5 w-3.5" />{progress}% complete</span>}
        {isFree && <span className="flex items-center gap-1 text-primary-600 font-medium"><PlayCircle className="h-3.5 w-3.5" />Start free</span>}
        {isLocked && !batch.isFree && <span className="flex items-center gap-1 text-neutral-500 font-medium"><Clock className="h-3.5 w-3.5" />₹{batch.discountPrice ?? batch.price}</span>}
      </div>
      {isPurchased && progress > 0 && <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} /></div>}
      {isPurchased && <Link to={`/student/batches/${batch.slug}`} className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"><PlayCircle className="h-4 w-4" />Continue Learning</Link>}
      {isFree && <Link to={`/student/batches/${batch.slug}`} className="flex items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"><PlayCircle className="h-4 w-4" />Start Learning</Link>}
      {isLocked && <div className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-400"><Lock className="h-4 w-4" />Unlock to Access</div>}
    </div>
  );
}

export const StudentBatchListCard = memo(StudentBatchListCardComponent);
