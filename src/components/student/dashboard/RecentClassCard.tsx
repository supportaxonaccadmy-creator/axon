import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FileText, HelpCircle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StudentRecentClass } from '@/types/studentDashboard';

const TYPE_ICONS = { video: PlayCircle, pdf: FileText, mcq: HelpCircle } as const;

interface RecentClassCardProps { item: StudentRecentClass; }

function RecentClassCardComponent({ item }: RecentClassCardProps) {
  const Icon = TYPE_ICONS[item.type] ?? PlayCircle;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-sm">
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', item.type === 'video' ? 'bg-primary-50 text-primary-600' : item.type === 'pdf' ? 'bg-accent-50 text-accent-600' : 'bg-success-50 text-success-600')}><Icon className="h-4 w-4" strokeWidth={2} /></div>
      <div className="min-w-0 flex-1"><Link to={`/student/batches/${item.batchId}`} className="truncate text-sm font-medium text-neutral-800 hover:text-primary-700 transition-colors">{item.classTitle}</Link><p className="truncate text-xs text-neutral-500">{item.batchTitle}</p></div>
      <div className="shrink-0 text-right">{item.duration && <p className="flex items-center gap-1 text-xs text-neutral-400"><Clock className="h-3 w-3" />{item.duration}</p>}<p className="text-xs text-neutral-400">{new Date(item.accessedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p></div>
    </div>
  );
}

export const RecentClassCard = memo(RecentClassCardComponent);
