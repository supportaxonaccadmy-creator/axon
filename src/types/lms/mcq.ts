import type { LmsStatus } from './batch';

export type McqCorrectOption = 'a' | 'b' | 'c' | 'd';

export interface McqSet {
  id: string;
  classId: string;
  title: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  durationMinutes: number | null;
  totalMarks: number;
  passingMarks: number;
  attemptsAllowed: number | null;
  shuffleQuestions: boolean;
  showResult: boolean;
  status: LmsStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface McqSetInsert {
  classId: string;
  title: string;
  slug: string;
  description?: string | null | undefined;
  instructions?: string | null | undefined;
  durationMinutes?: number | null | undefined;
  totalMarks?: number | undefined;
  passingMarks?: number | undefined;
  attemptsAllowed?: number | null | undefined;
  shuffleQuestions?: boolean | undefined;
  showResult?: boolean | undefined;
  status?: LmsStatus | undefined;
  sortOrder?: number | undefined;
}

export interface McqSetUpdate {
  classId?: string | undefined;
  title?: string | undefined;
  slug?: string | undefined;
  description?: string | null | undefined;
  instructions?: string | null | undefined;
  durationMinutes?: number | null | undefined;
  totalMarks?: number | undefined;
  passingMarks?: number | undefined;
  attemptsAllowed?: number | null | undefined;
  shuffleQuestions?: boolean | undefined;
  showResult?: boolean | undefined;
  status?: LmsStatus | undefined;
  sortOrder?: number | undefined;
}

export interface McqSetRow {
  id: string;
  class_id: string;
  title: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  duration_minutes: number | null;
  total_marks: number;
  passing_marks: number;
  attempts_allowed: number | null;
  shuffle_questions: boolean;
  show_result: boolean;
  status: LmsStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface McqQuestion {
  id: string;
  mcqSetId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: McqCorrectOption;
  explanation: string | null;
  marks: number;
  negativeMarks: number;
  sortOrder: number;
  status: LmsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface McqQuestionInsert {
  mcqSetId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: McqCorrectOption;
  explanation?: string | null | undefined;
  marks?: number | undefined;
  negativeMarks?: number | undefined;
  sortOrder?: number | undefined;
  status?: LmsStatus | undefined;
}

export interface McqQuestionUpdate {
  mcqSetId?: string | undefined;
  question?: string | undefined;
  optionA?: string | undefined;
  optionB?: string | undefined;
  optionC?: string | undefined;
  optionD?: string | undefined;
  correctOption?: McqCorrectOption | undefined;
  explanation?: string | null | undefined;
  marks?: number | undefined;
  negativeMarks?: number | undefined;
  sortOrder?: number | undefined;
  status?: LmsStatus | undefined;
}

export interface McqQuestionRow {
  id: string;
  mcq_set_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: McqCorrectOption;
  explanation: string | null;
  marks: number;
  negative_marks: number;
  sort_order: number;
  status: LmsStatus;
  created_at: string;
  updated_at: string;
}

export interface McqSetWithQuestions extends McqSet {
  questions: McqQuestion[];
}
