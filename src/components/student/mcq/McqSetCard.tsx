import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, HelpCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { McqSetSummary } from '@/types/mcqPractice';

interface McqSetCardProps { set: McqSetSummary; }

function McqSetCardComponent({ set }: McqSetCardProps) {
  const hasAttempts = set.attemptsUsed > 0;
  const attemptsRemaining = set.attemptsAllowed === null ? null : set.attemptsAllowed - set.attemptsUsed;
  const isExhausted = set.attemptsAllowed !== null && attemptsRemaining === 0;
  return (
    <Link to={`/student/mcq/${set.slug}`} className={cn('group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:border-primary-200', isExhausted && 'opacity-70')}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50"><HelpCircle className="h-5 w-5 text-primary-600" strokeWidth={2} /></div>
        {hasAttempts && set.bestScore !== null ? <Badge variant="success"><Award className="mr-1 h-3 w-3" />Best: {set.bestScore}%</Badge> : !hasAttempts ? <Badge variant="primary">New</Badge> : <Badge variant="default">Completed</Badge>}
        {isExhausted && <Badge variant="default">Completed</Badge>}
      </div>
      <div><p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">{set.title}</p>{set.description && <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{set.description}</p>}</div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" />{set.questionCount} questions</span>
        {set.durationMinutes && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{set.durationMinutes} min</span>}
        <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{set.totalMarks} marks</span>
      </div>
      {hasAttempts && <div className="flex items-center justify-between text-xs"><span className="text-neutral-500">Attempts: {set.attemptsUsed}{set.attemptsAllowed !== null ? `/${set.attemptsAllowed}` : ''}</span>{set.bestScore !== null && <span className="flex items-center gap-1 font-medium text-primary-600"><TrendingUp className="h-3 w-3" />{set.bestScore}%</span>}</div>}
      <div className={cn('flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isExhausted ? 'bg-neutral-100 text-neutral-400' : 'bg-primary-600 text-white group-hover:bg-primary-700')}>{isExhausted ? 'Review Results' : 'Start Practice'}<ChevronRight className="h-4 w-4" /></div>
    </Link>
  );
}

export const McqSetCard = memo(McqSetCardComponent);
