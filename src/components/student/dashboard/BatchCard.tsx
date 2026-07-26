import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StudentBatchInfo } from '@/types/studentDashboard';

interface BatchCardProps { batch: StudentBatchInfo; }

function BatchCardComponent({ batch }: BatchCardProps) {
  return (
    <Link to={`/student/batches/${batch.slug}`} className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:border-primary-200">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50"><Layers className="h-5 w-5 text-primary-600" strokeWidth={2} /></div>
        {batch.expiresAt && <span className="flex items-center gap-1 text-xs text-neutral-400"><Clock className="h-3 w-3" />Expires {new Date(batch.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>}
      </div>
      <div><p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">{batch.title}</p>{batch.description && <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{batch.description}</p>}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-neutral-500"><CheckCircle2 className="h-3.5 w-3.5" />{batch.completedClasses}/{batch.totalClasses} classes</span>
        <span className={cn('font-medium', batch.progress > 0 ? 'text-primary-600' : 'text-neutral-400')}>{batch.progress}% complete</span>
      </div>
      {batch.progress > 0 && <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${batch.progress}%` }} /></div>}
    </Link>
  );
}

export const BatchCard = memo(BatchCardComponent);
