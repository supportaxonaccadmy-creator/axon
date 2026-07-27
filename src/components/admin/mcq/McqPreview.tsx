import { memo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Award, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { McqQuestion, McqCorrectOption } from '@/types/lms';
import { useMcqPreview } from '@/hooks/useAdminMcq';

interface McqPreviewProps {
  questions: McqQuestion[];
}

const OPTION_LABELS: Record<McqCorrectOption, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

function McqPreviewComponent({ questions }: McqPreviewProps) {
  const { currentQuestion, currentIndex, answers, showResult, score, selectAnswer, next, prev, reset, setShowResult } = useMcqPreview(questions);
  const [revealAnswer, setRevealAnswer] = useState(false);

  const handleReveal = useCallback(() => setRevealAnswer((v) => !v), []);

  if (questions.length === 0) return <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">No questions to preview. Add questions first.</div>;

  if (!currentQuestion) return null;

  const options: Array<{ key: McqCorrectOption; text: string }> = [
    { key: 'a', text: currentQuestion.optionA },
    { key: 'b', text: currentQuestion.optionB },
    { key: 'c', text: currentQuestion.optionC },
    { key: 'd', text: currentQuestion.optionD },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">{currentIndex + 1}</span>
          <span className="text-sm text-neutral-500">of {questions.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleReveal}><Eye className="h-3.5 w-3.5" />{revealAnswer ? 'Hide Answer' : 'Reveal Answer'}</Button>
          {!showResult ? (
            <Button size="sm" variant="success" onClick={() => setShowResult(true)}>Submit</Button>
          ) : (
            <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="h-3.5 w-3.5" />Reset</Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-base font-semibold text-neutral-900">{currentQuestion.question}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">+{currentQuestion.marks} marks</span>
          <span className="rounded bg-error-50 px-2 py-0.5 text-xs font-medium text-error-700">-{currentQuestion.negativeMarks} neg</span>
        </div>
        <div className="mt-4 space-y-2">
          {options.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.key;
            const isCorrect = opt.key === currentQuestion.correctOption;
            const showCorrect = showResult || revealAnswer;
            return (
              <button
                key={opt.key}
                onClick={() => !showResult && selectAnswer(currentQuestion.id, opt.key)}
                disabled={showResult}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all',
                  showCorrect && isCorrect ? 'border-success-300 bg-success-50' : '',
                  showCorrect && isSelected && !isCorrect ? 'border-error-300 bg-error-50' : '',
                  !showCorrect && isSelected ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300',
                  showResult ? 'cursor-default' : 'cursor-pointer',
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium">{OPTION_LABELS[opt.key]}</span>
                <span className="flex-1 text-neutral-800">{opt.text}</span>
                {showCorrect && isCorrect && <CheckCircle2 className="h-4 w-4 text-success-600" />}
                {showCorrect && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-error-600" />}
              </button>
            );
          })}
        </div>
        {(showResult || revealAnswer) && currentQuestion.explanation && (
          <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
            <span className="font-medium text-neutral-800">Explanation: </span>{currentQuestion.explanation}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" disabled={currentIndex === 0} onClick={prev}><ChevronLeft className="h-4 w-4" />Previous</Button>
        <Button size="sm" variant="outline" disabled={currentIndex === questions.length - 1} onClick={next}>Next<ChevronRight className="h-4 w-4" /></Button>
      </div>

      {showResult && score && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center shadow-sm">
          <Award className="mx-auto h-10 w-10 text-primary-600" />
          <p className="mt-2 text-2xl font-bold text-neutral-900">{score.correct} / {score.total} Correct</p>
          <p className="mt-1 text-sm text-neutral-600">Total Marks: {score.totalMarks}</p>
        </div>
      )}
    </div>
  );
}

export const McqPreview = memo(McqPreviewComponent);
