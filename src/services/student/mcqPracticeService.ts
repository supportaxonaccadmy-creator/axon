import type { McqSet, McqQuestion, McqSetWithQuestions, McqCorrectOption } from '@/types/lms';
import type { McqAttemptResult, McqAttemptAnswer, McqSetSummary, McqDashboardStats } from '@/types/mcqPractice';
import { mcqService } from '@/services/lms/mcqService';
import { logger } from '@/lib/logger';
import { calculateScore, hasPassed, shuffleQuestions } from '@/lib/helpers/mcqHelper';

function generateAttemptId(): string {
  return `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const mcqPracticeService = {
  async getAvailableSets(): Promise<{ data: McqSetSummary[] | null; error: string | null }> {
    try {
      const result = await mcqService.listSets({ publishedOnly: true });
      if (result.error) return { data: null, error: result.error };
      const summaries: McqSetSummary[] = await Promise.all(
        result.data.map(async (set) => {
          const qResult = await mcqService.listQuestions(set.id, { publishedOnly: true });
          const questionCount = qResult.data?.length ?? 0;
          return {
            id: set.id, title: set.title, slug: set.slug, description: set.description,
            durationMinutes: set.durationMinutes, totalMarks: set.totalMarks, passingMarks: set.passingMarks,
            questionCount, attemptsUsed: 0, attemptsAllowed: set.attemptsAllowed,
            bestScore: null, lastAttemptedAt: null, status: set.status,
          };
        }),
      );
      return { data: summaries, error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load MCQ sets';
      logger.error('mcqPracticeService.getAvailableSets', { error: msg });
      return { data: null, error: msg };
    }
  },

  async getSetForPractice(slug: string): Promise<{ data: McqSetWithQuestions | null; error: string | null }> {
    try {
      const setsResult = await mcqService.listSets({ publishedOnly: true });
      if (setsResult.error) return { data: null, error: setsResult.error };
      const set = setsResult.data.find((s) => s.slug === slug);
      if (!set) return { data: null, error: 'MCQ set not found' };
      return mcqService.getSetWithQuestions(set.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load MCQ set';
      logger.error('mcqPracticeService.getSetForPractice', { error: msg });
      return { data: null, error: msg };
    }
  },

  prepareQuestions(set: McqSetWithQuestions): McqQuestion[] {
    const questions = set.questions.filter((q) => q.status === 'published');
    return set.shuffleQuestions ? shuffleQuestions(questions) : questions;
  },

  calculateResult(
    set: McqSet, questions: McqQuestion[], answers: Record<string, McqCorrectOption | null>,
    markedQuestions: Set<string>, startedAt: string, submittedAt: string,
  ): McqAttemptResult {
    const score = calculateScore(questions, answers as Record<string, McqCorrectOption>);
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter((q) => answers[q.id] !== null && answers[q.id] !== undefined).length;
    const correctAnswers = score.correct;
    const incorrectAnswers = score.wrong;
    const skippedQuestions = totalQuestions - answeredQuestions;
    const percentage = score.totalMarks > 0 ? Math.round((score.obtainedMarks / score.totalMarks) * 100) : 0;
    const passed = hasPassed(score.obtainedMarks, set.passingMarks);
    const timeTakenSeconds = Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000);
    const attemptAnswers: McqAttemptAnswer[] = questions.map((q) => ({
      questionId: q.id, selectedOption: answers[q.id] ?? null,
      isCorrect: answers[q.id] === q.correctOption, timeSpentSeconds: 0, isMarked: markedQuestions.has(q.id),
    }));
    return {
      attemptId: generateAttemptId(), setId: set.id, setSlug: set.slug, setTitle: set.title,
      profileId: '', totalQuestions, answeredQuestions, correctAnswers, incorrectAnswers, skippedQuestions,
      totalMarks: score.totalMarks, obtainedMarks: score.obtainedMarks, percentage,
      passingMarks: set.passingMarks, hasPassed: passed, timeTakenSeconds,
      startedAt, submittedAt, answers: attemptAnswers,
    };
  },

  async getDashboardStats(_profileId: string): Promise<{ data: McqDashboardStats | null; error: string | null }> {
    try {
      const setsResult = await this.getAvailableSets();
      if (setsResult.error || !setsResult.data) return { data: null, error: setsResult.error };
      const availableSets = setsResult.data;
      return {
        data: {
          availableTests: availableSets.length, completedTests: 0, pendingPractice: availableSets.length,
          totalAttempts: 0, averageScore: 0, bestScore: 0, recentAttempts: [], availableSets,
        }, error: null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
      logger.error('mcqPracticeService.getDashboardStats', { error: msg });
      return { data: null, error: msg };
    }
  },
};
