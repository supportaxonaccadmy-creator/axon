import { memo, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import type { Option } from '@/types/common';
import type { LmsStatus, McqCorrectOption } from '@/types/lms';

export interface McqQuestionFormData {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: McqCorrectOption;
  explanation: string;
  marks: number;
  negativeMarks: number;
  status: LmsStatus;
  sortOrder: number;
}

export interface McqQuestionFormErrors {
  question?: string | undefined;
  optionA?: string | undefined;
  optionB?: string | undefined;
  correctOption?: string | undefined;
  marks?: string | undefined;
  negativeMarks?: string | undefined;
}

interface McqQuestionEditorProps {
  form: McqQuestionFormData;
  onFormChange: (field: keyof McqQuestionFormData, value: string | number | boolean | null) => void;
  errors: McqQuestionFormErrors;
  generalError: string | null;
}

const STATUS_OPTIONS: Option[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

const CORRECT_OPTIONS: Option[] = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
  { label: 'Option D', value: 'd' },
];

function McqQuestionEditorComponent({ form, onFormChange, errors, generalError }: McqQuestionEditorProps) {
  const handleChange = useCallback((field: keyof McqQuestionFormData, value: string | number | boolean | null) => {
    onFormChange(field, value);
  }, [onFormChange]);

  return (
    <div className="space-y-4">
      {generalError && <Alert variant="error" title="Error">{generalError}</Alert>}
      <Textarea label="Question" placeholder="Enter the question..." value={form.question} onChange={(e) => handleChange('question', e.target.value)} error={errors.question ?? ''} rows={3} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Option A" placeholder="Option A text" value={form.optionA} onChange={(e) => handleChange('optionA', e.target.value)} error={errors.optionA} />
        <Input label="Option B" placeholder="Option B text" value={form.optionB} onChange={(e) => handleChange('optionB', e.target.value)} error={errors.optionB} />
        <Input label="Option C" placeholder="Option C text" value={form.optionC} onChange={(e) => handleChange('optionC', e.target.value)} />
        <Input label="Option D" placeholder="Option D text" value={form.optionD} onChange={(e) => handleChange('optionD', e.target.value)} />
      </div>
      <Select label="Correct Answer" options={CORRECT_OPTIONS} value={form.correctOption} onChange={(e) => handleChange('correctOption', e.target.value as McqCorrectOption)} error={errors.correctOption ?? ''} />
      <Textarea label="Explanation" placeholder="Explanation for the correct answer..." value={form.explanation} onChange={(e) => handleChange('explanation', e.target.value)} rows={2} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input label="Marks" type="number" value={form.marks} onChange={(e) => handleChange('marks', Number(e.target.value))} error={errors.marks} />
        <Input label="Negative Marks" type="number" value={form.negativeMarks} onChange={(e) => handleChange('negativeMarks', Number(e.target.value))} error={errors.negativeMarks} />
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => handleChange('sortOrder', Number(e.target.value))} />
      </div>
      <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => handleChange('status', e.target.value as LmsStatus)} />
    </div>
  );
}

export const McqQuestionEditor = memo(McqQuestionEditorComponent);
