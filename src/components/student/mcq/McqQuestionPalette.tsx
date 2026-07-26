import { memo } from 'react';
import { cn } from '@/utils/cn';
import type { McqQuestion } from '@/types/lms';
import type { McqQuestionStatus } from '@/types/mcqPractice';

interface McqQuestionPaletteProps {
  questions: McqQuestion[];
  currentIndex: number;
  answers: Record<string, McqCorrectOptionPlaceholder>;
  markedQuestions: Set<string>;
  visitedQuestions: Set<string>;
  onJump: (index: number) => void;
}

type McqCorrectOptionPlaceholder = string | null;

function getStatus(q: McqQuestion, answers: Record<string, McqCorrectOptionPlaceholder>, marked: Set<string>, visited: Set<string>): McqQuestionStatus {
  const isMarked = marked.has(q.id);
  const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
  const isVisited = visited.has(q.id);
  if (isMarked && isAnswered) return 'answered-marked';
  if (isMarked) return 'marked';
  if (isAnswered) return 'answered';
  if (isVisited) return 'skipped';
  return 'unanswered';
}

const STATUS_STYLES: Record<McqQuestionStatus, string> = {
  unanswered: 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200',
  answered: 'bg-success-100 text-success-700 border-success-200 hover:bg-success-200',
  skipped: 'bg-warning-100 text-warning-700 border-warning-200 hover:bg-warning-200',
  marked: 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200',
  'answered-marked': 'bg-success-100 text-success-700 border-primary-400 hover:bg-success-200 ring-2 ring-primary-300',
};

function McqQuestionPaletteComponent({ questions, currentIndex, answers, markedQuestions, visitedQuestions, onJump }: McqQuestionPaletteProps) {
  const legend: { label: string; status: McqQuestionStatus }[] = [
    { label: 'Answered', status: 'answered' },
    { label: 'Not Answered', status: 'unanswered' },
    { label: 'Marked', status: 'marked' },
    { label: 'Visited', status: 'skipped' },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Question Palette</h3>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
        {questions.map((q, i) => {
          const status = getStatus(q, answers, markedQuestions, visitedQuestions);
          const isCurrent = i === currentIndex;
          return (
            <button key={q.id} onClick={() => onJump(i)} className={cn('flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-all', STATUS_STYLES[status], isCurrent && 'ring-2 ring-primary-500 ring-offset-1')}>{i + 1}</button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-3">
        {legend.map((item) => (
          <div key={item.status} className="flex items-center gap-1.5"><div className={cn('h-3 w-3 rounded border', STATUS_STYLES[item.status].split(' ').slice(0, 3).join(' '))} /><span className="text-xs text-neutral-500">{item.label}</span></div>
        ))}
      </div>
    </div>
  );
}

export const McqQuestionPalette = memo(McqQuestionPaletteComponent);
