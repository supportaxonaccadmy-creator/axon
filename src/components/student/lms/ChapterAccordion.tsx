import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen, Lock, FolderOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { HierarchyNode } from '@/services/lms/hierarchyService';

interface ChapterAccordionProps { chapter: HierarchyNode; enrolled: boolean; index: number; defaultOpen?: boolean; }

function ChapterAccordionComponent({ chapter, enrolled, index, defaultOpen = false }: ChapterAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const classCount = chapter.children.length;
  const isLocked = !enrolled;
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow', open && 'shadow-md')}>
      <button onClick={() => !isLocked && setOpen((v) => !v)} className={cn('flex w-full items-center gap-4 px-4 py-3.5 text-left', !isLocked && 'cursor-pointer hover:bg-neutral-50 rounded-xl transition-colors', isLocked && 'cursor-not-allowed opacity-70')}>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', isLocked ? 'bg-neutral-100 text-neutral-400' : 'bg-primary-50 text-primary-600')}><FolderOpen className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-xs font-medium text-neutral-400">Chapter {index + 1}</span>{isLocked && <Lock className="h-3 w-3 text-neutral-400" />}</div><p className="truncate text-sm font-semibold text-neutral-800">{chapter.title}</p></div>
        <div className="flex shrink-0 items-center gap-2"><span className="flex items-center gap-1 text-xs text-neutral-500"><BookOpen className="h-3 w-3" />{classCount} classes</span>{!isLocked && (open ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />)}</div>
      </button>
      {open && !isLocked && classCount > 0 && (
        <div className="border-t border-neutral-100 px-4 py-2 space-y-1 animate-fade-in">
          {chapter.children.map((cls, i) => (<Link key={cls.id} to={`/student/classes/${cls.slug}`} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-50 transition-colors"><span className="text-xs font-medium text-neutral-400 w-6">{i + 1}</span><ChevronRight className="h-3 w-3 text-neutral-300 group-hover:text-primary-500 transition-colors" /><span className="flex-1 truncate text-sm text-neutral-700 group-hover:text-primary-700 transition-colors">{cls.title}</span><Badge variant="default" className="text-[10px]">Class</Badge></Link>))}
        </div>
      )}
      {open && !isLocked && classCount === 0 && <div className="border-t border-neutral-100 px-4 py-6 text-center"><p className="text-xs text-neutral-400">No classes available in this chapter yet.</p></div>}
    </div>
  );
}

export const ChapterAccordion = memo(ChapterAccordionComponent);
