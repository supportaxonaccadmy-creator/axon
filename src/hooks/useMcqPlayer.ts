import { useState, useEffect, useCallback } from 'react';
import type { McqSetWithQuestions, McqQuestion, McqCorrectOption } from '@/types/lms';
import type { McqAttemptResult } from '@/types/mcqPractice';
import { mcqPracticeService } from '@/services/student/mcqPracticeService';

interface McqPlayerState {
  set: McqSetWithQuestions | null;
  questions: McqQuestion[];
  currentIndex: number;
  answers: Record<string, McqCorrectOption | null>;
  markedQuestions: Set<string>;
  visitedQuestions: Set<string>;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  loading: boolean;
  error: string | null;
  result: McqAttemptResult | null;
  startedAt: string;
  submitted: boolean;
}

export function useMcqPlayer(setSlug: string | undefined) {
  const [state, setState] = useState<McqPlayerState>({
    set: null, questions: [], currentIndex: 0, answers: {}, markedQuestions: new Set(),
    visitedQuestions: new Set(), timeRemainingSeconds: 0, totalDurationSeconds: 0,
    loading: true, error: null, result: null, startedAt: new Date().toISOString(), submitted: false,
  });

  const load = useCallback(() => {
    if (!setSlug) { setState((s) => ({ ...s, loading: false, error: 'No MCQ set specified' })); return; }
    setState((s) => ({ ...s, loading: true, error: null }));
    mcqPracticeService.getSetForPractice(setSlug).then((result) => {
      if (result.error || !result.data) { setState((s) => ({ ...s, loading: false, error: result.error ?? 'MCQ set not found' })); return; }
      const set = result.data;
      const questions = mcqPracticeService.prepareQuestions(set);
      const duration = (set.durationMinutes ?? 0) * 60;
      setState({
        set, questions, currentIndex: 0, answers: {}, markedQuestions: new Set(),
        visitedQuestions: new Set(questions.length > 0 ? [questions[0]!.id] : []),
        timeRemainingSeconds: duration, totalDurationSeconds: duration,
        loading: false, error: null, result: null, startedAt: new Date().toISOString(), submitted: false,
      });
    }).catch((err: unknown) => {
      setState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : 'Failed to load' }));
    });
  }, [setSlug]);

  useEffect(() => { load(); }, [load]);

  const selectAnswer = useCallback((questionId: string, option: McqCorrectOption) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: option } }));
  }, []);

  const clearAnswer = useCallback((questionId: string) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: null } }));
  }, []);

  const toggleMark = useCallback((questionId: string) => {
    setState((s) => {
      const newMarked = new Set(s.markedQuestions);
      if (newMarked.has(questionId)) newMarked.delete(questionId);
      else newMarked.add(questionId);
      return { ...s, markedQuestions: newMarked };
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((s) => {
      if (index < 0 || index >= s.questions.length) return s;
      const newVisited = new Set(s.visitedQuestions);
      newVisited.add(s.questions[index]!.id);
      return { ...s, currentIndex: index, visitedQuestions: newVisited };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((s) => {
      if (s.currentIndex >= s.questions.length - 1) return s;
      const newIndex = s.currentIndex + 1;
      const newVisited = new Set(s.visitedQuestions);
      newVisited.add(s.questions[newIndex]!.id);
      return { ...s, currentIndex: newIndex, visitedQuestions: newVisited };
    });
  }, []);

  const previousQuestion = useCallback(() => {
    setState((s) => {
      if (s.currentIndex <= 0) return s;
      return { ...s, currentIndex: s.currentIndex - 1 };
    });
  }, []);

  const tickTimer = useCallback(() => {
    setState((s) => {
      if (s.submitted || s.timeRemainingSeconds <= 0) return s;
      const newTime = s.timeRemainingSeconds - 1;
      if (newTime <= 0) return { ...s, timeRemainingSeconds: 0 };
      return { ...s, timeRemainingSeconds: newTime };
    });
  }, []);

  const submitAttempt = useCallback(() => {
    setState((s) => {
      if (!s.set || s.submitted) return s;
      const submittedAt = new Date().toISOString();
      const result = mcqPracticeService.calculateResult(
        s.set, s.questions, s.answers, s.markedQuestions, s.startedAt, submittedAt,
      );
      return { ...s, result, submitted: true };
    });
  }, []);

  return {
    ...state, selectAnswer, clearAnswer, toggleMark, goToQuestion, nextQuestion, previousQuestion,
    tickTimer, submitAttempt, refresh: load,
  };
}
