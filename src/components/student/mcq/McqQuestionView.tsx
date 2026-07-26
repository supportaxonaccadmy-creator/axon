import { memo } from 'react';
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { McqQuestion, McqCorrectOption } from '@/types/lms';
import { McqOptionSelector } from './McqOptionSelector';

interface McqQuestionViewProps {
  question: McqQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: McqCorrectOption | null;
  isMarked: boolean;
  onSelect: (option: McqCorrectOption) => void;
  onClear: () => void;
  onToggleMark: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function McqQuestionViewComponent({ question, questionNumber, totalQuestions, selectedOption, isMarked, onSelect, onClear, onToggleMark, onNext, onPrevious, onSubmit, isFirst, isLast }: McqQuestionViewProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">Question {questionNumber} of {totalQuestions}</span>
          <span className="text-xs text-neutral-400">+{question.marks} marks{question.negativeMarks > 0 && ` | -${question.negativeMarks} neg`}</span>
        </div>
        <button onClick={onToggleMark} className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors', isMarked ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50')}>
          {isMarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}{isMarked ? 'Marked' : 'Mark for Review'}
        </button>
      </div>
      <div><p className="text-base font-medium text-neutral-900 leading-relaxed">{question.question}</p></div>
      <McqOptionSelector question={question} selectedOption={selectedOption} onSelect={onSelect} />
      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <div className="flex items-center gap-2">
          <button onClick={onPrevious} disabled={isFirst} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
          <button onClick={onClear} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"><Flag className="h-3.5 w-3.5" />Clear</button>
        </div>
        {isLast ? <button onClick={onSubmit} className="flex items-center gap-1.5 rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success-700">Submit Test</button> : <button onClick={onNext} className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">Next <ChevronRight className="h-4 w-4" /></button>}
      </div>
    </div>
  );
}

export const McqQuestionView = memo(McqQuestionViewComponent);
