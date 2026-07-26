import type { McqCorrectOption } from '@/types/lms';

export type McqQuestionStatus = 'unanswered' | 'answered' | 'skipped' | 'marked' | 'answered-marked';

export interface McqAttemptAnswer {
  questionId: string;
  selectedOption: McqCorrectOption | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  isMarked: boolean;
}

export interface McqAttemptState {
  setId: string;
  setSlug: string;
  setTitle: string;
  profileId: string;
  startedAt: string;
  submittedAt: string | null;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  answers: Record<string, McqCorrectOption | null>;
  markedQuestions: Set<string>;
  visitedQuestions: Set<string>;
  currentQuestionIndex: number;
  status: 'in-progress' | 'submitted' | 'expired';
}

export interface McqAttemptResult {
  attemptId: string;
  setId: string;
  setSlug: string;
  setTitle: string;
  profileId: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passingMarks: number;
  hasPassed: boolean;
  timeTakenSeconds: number;
  startedAt: string;
  submittedAt: string;
  answers: McqAttemptAnswer[];
}

export interface McqDashboardStats {
  availableTests: number;
  completedTests: number;
  pendingPractice: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  recentAttempts: McqAttemptResult[];
  availableSets: McqSetSummary[];
}

export interface McqSetSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number | null;
  totalMarks: number;
  passingMarks: number;
  questionCount: number;
  attemptsUsed: number;
  attemptsAllowed: number | null;
  bestScore: number | null;
  lastAttemptedAt: string | null;
  status: string;
}
