import type { McqSet, McqQuestion, McqCorrectOption } from '@/types/lms';
import type { SortOption } from '@/lib/helpers/sortingHelper';

export interface McqFilterOptions {
  classId?: string | undefined;
  mcqSetId?: string | undefined;
  publishedOnly?: boolean | undefined;
  search?: string | undefined;
  sort?: SortOption | undefined;
}

export function buildMcqPath(batchSlug: string, subjectSlug: string, chapterSlug: string, classSlug: string, mcqSlug: string): string {
  return `/batches/${batchSlug}/${subjectSlug}/${chapterSlug}/${classSlug}/mcqs/${mcqSlug}`;
}

export function calculateScore(questions: McqQuestion[], answers: Record<string, McqCorrectOption>): { correct: number; wrong: number; totalMarks: number; obtainedMarks: number } {
  let correct = 0;
  let wrong = 0;
  let totalMarks = 0;
  let obtainedMarks = 0;
  for (const q of questions) {
    totalMarks += q.marks;
    const answer = answers[q.id];
    if (answer === q.correctOption) {
      correct += 1;
      obtainedMarks += q.marks;
    } else if (answer !== undefined) {
      wrong += 1;
      obtainedMarks -= q.negativeMarks;
    }
  }
  return { correct, wrong, totalMarks, obtainedMarks };
}

export function hasPassed(obtainedMarks: number, passingMarks: number): boolean {
  return obtainedMarks >= passingMarks;
}

export function shuffleQuestions<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function sortMcqSets(sets: McqSet[], sort: SortOption = { column: 'sort_order', direction: 'asc' }): McqSet[] {
  return [...sets].sort((a, b) => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const col = sort.column as keyof McqSet;
    const aVal = a[col];
    const bVal = b[col];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });
}

export function sortMcqQuestions(questions: McqQuestion[], sort: SortOption = { column: 'sort_order', direction: 'asc' }): McqQuestion[] {
  return [...questions].sort((a, b) => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const col = sort.column as keyof McqQuestion;
    const aVal = a[col];
    const bVal = b[col];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });
}
