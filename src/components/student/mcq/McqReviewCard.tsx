import { memo } from 'react';
import { CheckCircle2, XCircle, Bookmark, Lightbulb } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { McqQuestion, McqCorrectOption } from '@/types/lms';
import { McqOptionSelector } from './McqOptionSelector';

interface McqReviewCardProps { question: McqQuestion; questionNumber: number; selectedOption: McqCorrectOption | null; isMarked: boolean; }

function McqReviewCardComponent({ question, questionNumber, selectedOption, isMarked }: McqReviewCardProps) {
  const isCorrect = selectedOption === question.correctOption;
  const isUnanswered = selectedOption === null;
  return (
    <div className={cn('flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm', isCorrect ? 'border-success-200' : isUnanswered ? 'border-warning-200' : 'border-error-200')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">Question {questionNumber}</span>
          {isCorrect ? <span className="flex items-center gap-1 text-xs font-medium text-success-600"><CheckCircle2 className="h-3.5 w-3.5" />Correct</span> : isUnanswered ? <span className="flex items-center gap-1 text-xs font-medium text-warning-600"><XCircle className="h-3.5 w-3.5" />Skipped</span> : <span className="flex items-center gap-1 text-xs font-medium text-error-600"><XCircle className="h-3.5 w-3.5" />Incorrect</span>}
        </div>
        {isMarked && <span className="flex items-center gap-1 text-xs font-medium text-primary-600"><Bookmark className="h-3.5 w-3.5" />Marked</span>}
      </div>
      <p className="text-sm font-medium text-neutral-900 leading-relaxed">{question.question}</p>
      <McqOptionSelector question={question} selectedOption={selectedOption} onSelect={() => {}} showCorrect disabled />
      {question.explanation && <div className="rounded-lg border border-primary-100 bg-primary-50 p-4"><div className="flex items-start gap-2"><Lightbulb className="h-4 w-4 shrink-0 text-primary-600 mt-0.5" /><div><p className="text-xs font-semibold text-primary-700">Explanation</p><p className="mt-1 text-sm text-primary-800 leading-relaxed">{question.explanation}</p></div></div></div>}
    </div>
  );
}

export const McqReviewCard = memo(McqReviewCardComponent);
