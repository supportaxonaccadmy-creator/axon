import { useState, useEffect, useCallback, useMemo } from 'react';
import { mcqService } from '@/services/lms/mcqService';
import { classService } from '@/services/lms/classService';
import { chapterService } from '@/services/lms/chapterService';
import { subjectService } from '@/services/lms/subjectService';
import { batchService } from '@/services/lms/batchService';
import type { McqSet, McqQuestion, Class, Chapter, Subject, Batch, LmsStatus, McqCorrectOption } from '@/types/lms';

export interface McqSetWithRelations extends McqSet {
  classTitle: string;
  chapterTitle: string;
  subjectTitle: string;
  batchTitle: string;
  questionCount: number;
}

export interface McqQuestionStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  published: number;
  draft: number;
  archived: number;
  avgMarks: number;
  avgNegativeMarks: number;
}

interface UseAdminMcqSetsParams {
  search?: string | undefined;
  status?: string | undefined;
  classId?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export function useAdminMcqSets(params: UseAdminMcqSetsParams = {}) {
  const [sets, setSets] = useState<McqSetWithRelations[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(params.page ?? 1);
  const [pageSize, setPageSize] = useState(params.pageSize ?? 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clsResult, chapResult, subjResult, batchResult] = await Promise.all([
        classService.list(), chapterService.list(), subjectService.list(), batchService.list(),
      ]);
      const classList = clsResult.data ?? [];
      const chapterList = chapResult.data ?? [];
      const subjectList = subjResult.data ?? [];
      const batchList = batchResult.data ?? [];
      setClasses(classList);
      setChapters(chapterList);
      setSubjects(subjectList);
      setBatches(batchList);

      const opts: Record<string, unknown> = {};
      if (params.search) opts.search = params.search;
      if (params.classId) opts.classId = params.classId;
      opts.sort = { column: 'sort_order', direction: 'asc' as const };

      const result = await mcqService.paginateSets(page, pageSize, opts as never);
      let data = result.data;

      if (params.status && params.status !== 'all') {
        data = data.filter((s) => s.status === params.status);
      }

      const classMap = new Map(classList.map((c) => [c.id, c]));
      const chapterMap = new Map(chapterList.map((c) => [c.id, c]));
      const subjectMap = new Map(subjectList.map((s) => [s.id, s]));
      const batchMap = new Map(batchList.map((b) => [b.id, b]));

      const enriched = await Promise.all(
        data.map(async (s): Promise<McqSetWithRelations> => {
          const { data: questions } = await mcqService.listQuestions(s.id);
          const cls = classMap.get(s.classId);
          const ch = cls ? chapterMap.get(cls.chapterId) : undefined;
          const subj = ch ? subjectMap.get(ch.subjectId) : undefined;
          const batch = subj ? batchMap.get(subj.batchId) : undefined;
          return {
            ...s,
            classTitle: cls?.title ?? 'Unknown',
            chapterTitle: ch?.title ?? 'Unknown',
            subjectTitle: subj?.title ?? 'Unknown',
            batchTitle: batch?.title ?? 'Unknown',
            questionCount: questions?.length ?? 0,
          };
        }),
      );

      setSets(enriched);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MCQ sets');
      setSets([]);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.status, params.classId, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return { sets, classes, chapters, subjects, batches, loading, error, total, totalPages, page, pageSize, setPage, setPageSize, refresh: load };
}

export function useAdminMcqQuestions(mcqSetId: string | undefined) {
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!mcqSetId) { setLoading(false); setError('No MCQ set specified'); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await mcqService.listQuestions(mcqSetId, { publishedOnly: false });
    setQuestions(data ?? []);
    setError(err);
    setLoading(false);
  }, [mcqSetId]);

  useEffect(() => { load(); }, [load]);

  const stats: McqQuestionStats = useMemo(() => {
    const total = questions.length;
    if (total === 0) return { total: 0, easy: 0, medium: 0, hard: 0, published: 0, draft: 0, archived: 0, avgMarks: 0, avgNegativeMarks: 0 };
    const published = questions.filter((q) => q.status === 'published').length;
    const draft = questions.filter((q) => q.status === 'draft').length;
    const archived = questions.filter((q) => q.status === 'archived').length;
    const avgMarks = questions.reduce((sum, q) => sum + q.marks, 0) / total;
    const avgNegativeMarks = questions.reduce((sum, q) => sum + q.negativeMarks, 0) / total;
    return { total, easy: 0, medium: 0, hard: 0, published, draft, archived, avgMarks, avgNegativeMarks };
  }, [questions]);

  return { questions, stats, loading, error, refresh: load, setQuestions };
}

export function useMcqPreview(questions: McqQuestion[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, McqCorrectOption>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = useMemo(() => questions[currentIndex] ?? null, [questions, currentIndex]);

  const selectAnswer = useCallback((questionId: string, option: McqCorrectOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
  }, []);

  const score = useMemo(() => {
    if (!showResult) return null;
    let correct = 0;
    let totalMarks = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctOption) {
        correct++;
        totalMarks += q.marks;
      } else if (answers[q.id]) {
        totalMarks -= q.negativeMarks;
      }
    }
    return { correct, total: questions.length, totalMarks };
  }, [questions, answers, showResult]);

  return { currentQuestion, currentIndex, answers, showResult, score, selectAnswer, next, prev, reset, setShowResult, setCurrentIndex };
}

export type { LmsStatus, McqCorrectOption };
