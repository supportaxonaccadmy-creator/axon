import { memo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { McqQuestion, McqCorrectOption } from '@/types/lms';

interface McqOptionSelectorProps {
  question: McqQuestion;
  selectedOption: McqCorrectOption | null;
  onSelect: (option: McqCorrectOption) => void;
  showCorrect?: boolean;
  disabled?: boolean;
}

const OPTIONS: { key: McqCorrectOption; label: string }[] = [
  { key: 'a', label: 'A' }, { key: 'b', label: 'B' }, { key: 'c', label: 'C' }, { key: 'd', label: 'D' },
];

function McqOptionSelectorComponent({ question, selectedOption, onSelect, showCorrect = false, disabled = false }: McqOptionSelectorProps) {
  return (
    <div className="space-y-3">
      {OPTIONS.map((opt) => {
        const optionText = opt.key === 'a' ? question.optionA : opt.key === 'b' ? question.optionB : opt.key === 'c' ? question.optionC : question.optionD;
        const isSelected = selectedOption === opt.key;
        const isCorrect = showCorrect && question.correctOption === opt.key;
        const isWrong = showCorrect && isSelected && question.correctOption !== opt.key;
        return (
          <button key={opt.key} onClick={() => !disabled && onSelect(opt.key)} disabled={disabled} className={cn('flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all', disabled && 'cursor-not-allowed', isCorrect ? 'border-success-300 bg-success-50' : isWrong ? 'border-error-300 bg-error-50' : isSelected ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-neutral-50')}>
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors', isCorrect ? 'bg-success-500 text-white' : isWrong ? 'bg-error-500 text-white' : isSelected ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600')}>{isCorrect ? <Check className="h-4 w-4" /> : isWrong ? <X className="h-4 w-4" /> : opt.label}</div>
            <span className={cn('flex-1 text-sm', isCorrect ? 'text-success-800 font-medium' : isWrong ? 'text-error-800 font-medium' : isSelected ? 'text-primary-800 font-medium' : 'text-neutral-700')}>{optionText}</span>
          </button>
        );
      })}
    </div>
  );
}

export const McqOptionSelector = memo(McqOptionSelectorComponent);
