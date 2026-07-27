import { memo, useState } from 'react';
import { ChevronUp, ChevronDown, Edit, Copy, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ContentStatusBadge } from '@/components/admin/content';
import { cn } from '@/utils/cn';
import type { McqQuestion, McqCorrectOption } from '@/types/lms';

interface McqQuestionCardProps {
  question: McqQuestion;
  index: number;
  total: number;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const OPTION_LABELS: Record<McqCorrectOption, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

function McqQuestionCardComponent({ question, index, total, selected, onToggleSelect, onEdit, onDuplicate, onDelete, onMoveUp, onMoveDown }: McqQuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const options: Array<{ key: McqCorrectOption; text: string }> = [
    { key: 'a', text: question.optionA },
    { key: 'b', text: question.optionB },
    { key: 'c', text: question.optionC },
    { key: 'd', text: question.optionD },
  ];

  return (
    <div className={cn('rounded-lg border bg-white p-4 shadow-sm transition-all', selected ? 'border-primary-300 bg-primary-50/30' : 'border-neutral-200')}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(question.id)} className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" aria-label={`Select question ${index + 1}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <button onClick={() => setExpanded((e) => !e)} className="block w-full text-left">
                <p className="text-sm font-semibold text-neutral-900">Q{index + 1}. {question.question}</p>
              </button>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={question.correctOption === 'a' ? 'success' : 'default'} className="text-[10px]">Correct: {OPTION_LABELS[question.correctOption]}</Badge>
                <Badge variant="default" className="text-[10px]">+{question.marks} / -{question.negativeMarks}</Badge>
                <ContentStatusBadge status={question.status} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onMoveUp(question.id)} disabled={index === 0} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => onMoveDown(question.id)} disabled={index === total - 1} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-3.5 w-3.5" /></button>
              <button onClick={() => onEdit(question.id)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" aria-label="Edit"><Edit className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDuplicate(question.id)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" aria-label="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDelete(question.id)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-error-600" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {expanded && (
            <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
              {options.map((opt) => {
                const isCorrect = opt.key === question.correctOption;
                return (
                  <div key={opt.key} className={cn('flex items-center gap-2 rounded-lg border p-2 text-sm', isCorrect ? 'border-success-200 bg-success-50' : 'border-neutral-100')}>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium">{OPTION_LABELS[opt.key]}</span>
                    <span className="flex-1 text-neutral-700">{opt.text}</span>
                    {isCorrect ? <CheckCircle2 className="h-4 w-4 text-success-600" /> : <XCircle className="h-4 w-4 text-neutral-300" />}
                  </div>
                );
              })}
              {question.explanation && (
                <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
                  <span className="font-medium text-neutral-800">Explanation: </span>{question.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const McqQuestionCard = memo(McqQuestionCardComponent);
