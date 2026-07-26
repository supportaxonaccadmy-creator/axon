import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FileText, HelpCircle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StudentContinueLearning } from '@/types/studentDashboard';

const TYPE_ICONS = { video: PlayCircle, pdf: FileText, mcq: HelpCircle } as const;

interface ContinueLearningCardProps { item: StudentContinueLearning; }

function ContinueLearningCardComponent({ item }: ContinueLearningCardProps) {
  const Icon = TYPE_ICONS[item.type] ?? PlayCircle;
  return (
    <Link to={`/student/batches/${item.batchId}/${item.classSlug}`} className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:border-primary-200">
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', item.type === 'video' ? 'bg-primary-50 text-primary-600' : item.type === 'pdf' ? 'bg-accent-50 text-accent-600' : 'bg-success-50 text-success-600')}><Icon className="h-6 w-6" strokeWidth={2} /></div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">{item.classTitle}</p>
        <p className="truncate text-xs text-neutral-500">{item.batchTitle}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">{item.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.duration}</span>}<span>{item.progress}% complete</span></div>
      </div>
      <PlayCircle className="h-5 w-5 shrink-0 text-neutral-300 group-hover:text-primary-500 transition-colors" />
    </Link>
  );
}

export const ContinueLearningCard = memo(ContinueLearningCardComponent);
