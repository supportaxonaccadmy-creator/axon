import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { HierarchyNode } from '@/services/lms/hierarchyService';

interface SubjectCardProps { subject: HierarchyNode; enrolled: boolean; index: number; }

function SubjectCardComponent({ subject, enrolled, index }: SubjectCardProps) {
  const chapterCount = subject.children.length;
  const isLocked = !enrolled;
  return (
    <Link to={isLocked ? '#' : `/student/subjects/${subject.slug}`} className={cn('group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-150', !isLocked && 'hover:shadow-md hover:border-primary-200', isLocked && 'opacity-70 cursor-not-allowed')} onClick={(e) => isLocked && e.preventDefault()}>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold', isLocked ? 'bg-neutral-100 text-neutral-400' : 'bg-primary-50 text-primary-600')}>{index + 1}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-neutral-800">{subject.title}</p>{isLocked && <Lock className="h-3.5 w-3.5 shrink-0 text-neutral-400" />}</div>
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500"><span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{chapterCount} chapters</span></div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!isLocked && chapterCount > 0 && <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Available</Badge>}
        {!isLocked && <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />}
      </div>
    </Link>
  );
}

export const SubjectCard = memo(SubjectCardComponent);
