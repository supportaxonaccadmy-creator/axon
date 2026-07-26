import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FileText, HelpCircle, Clock, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { HierarchyNode } from '@/services/lms/hierarchyService';

interface ClassCardProps { cls: HierarchyNode; chapterSlug: string; enrolled: boolean; index: number; hasVideo?: boolean; hasPdf?: boolean; hasMcq?: boolean; duration?: number | null; isCompleted?: boolean; }

function ClassCardComponent({ cls, enrolled, index, hasVideo, hasPdf, hasMcq, duration, isCompleted }: ClassCardProps) {
  const isLocked = !enrolled;
  const icons = [];
  if (hasVideo) icons.push({ icon: PlayCircle, label: 'Video', color: 'text-primary-600 bg-primary-50' });
  if (hasPdf) icons.push({ icon: FileText, label: 'PDF', color: 'text-accent-600 bg-accent-50' });
  if (hasMcq) icons.push({ icon: HelpCircle, label: 'MCQ', color: 'text-success-600 bg-success-50' });
  if (icons.length === 0) icons.push({ icon: PlayCircle, label: 'Class', color: 'text-primary-600 bg-primary-50' });
  return (
    <div className={cn('group flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all duration-150', isLocked ? 'border-neutral-200 opacity-70' : 'border-neutral-200 hover:shadow-md hover:border-primary-200')}>
      <div className="flex shrink-0 items-center gap-1">{icons.map((ic, i) => { const Icon = ic.icon; return <div key={i} className={cn('flex h-9 w-9 items-center justify-center rounded-lg', ic.color)}><Icon className="h-4 w-4" strokeWidth={2} /></div>; })}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><span className="text-xs font-medium text-neutral-400">Class {index + 1}</span>{isCompleted && <Badge variant="success" className="text-[10px]"><CheckCircle2 className="mr-1 h-2.5 w-2.5" />Completed</Badge>}{isLocked && <Lock className="h-3 w-3 text-neutral-400" />}</div>
        <p className="truncate text-sm font-semibold text-neutral-800">{cls.title}</p>
        {duration != null && <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400"><Clock className="h-3 w-3" />{duration < 60 ? `${duration} min` : `${Math.floor(duration / 60)}h ${duration % 60}m`}</p>}
      </div>
      <div className="shrink-0">{isLocked ? <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-400"><Lock className="h-3.5 w-3.5" />Locked</div> : <Link to={`/student/classes/${cls.slug}`} className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700">{isCompleted ? 'Review' : 'Continue'}<ArrowRight className="h-3.5 w-3.5" /></Link>}</div>
    </div>
  );
}

export const ClassCard = memo(ClassCardComponent);
