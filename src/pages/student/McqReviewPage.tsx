import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { RefreshCw, Home, ArrowLeft, Filter } from 'lucide-react';
import { McqReviewCard } from '@/components/student/mcq/McqReviewCard';
import { Button } from '@/components/ui/Button';
import { useState, useMemo, useEffect } from 'react';
import type { McqAttemptResult } from '@/types/mcqPractice';
import { mcqPracticeService } from '@/services/student/mcqPracticeService';
import type { McqQuestion, McqCorrectOption } from '@/types/lms';
import { cn } from '@/utils/cn';

type ReviewFilter = 'all' | 'correct' | 'incorrect' | 'skipped' | 'marked';

export function McqReviewPage() {
  const { setSlug } = useParams<{ setSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const result = (location.state as { result: McqAttemptResult | null } | null)?.result ?? null;
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    if (!setSlug) return;
    setLoadingQuestions(true);
    mcqPracticeService.getSetForPractice(setSlug).then((res) => {
      if (res.data) setQuestions(res.data.questions.filter((q) => q.status === 'published'));
      setLoadingQuestions(false);
    });
  }, [setSlug]);

  const filteredData = useMemo(() => {
    if (!result || questions.length === 0) return [];
    return questions.map((q, i) => {
      const answer = result.answers.find((a) => a.questionId === q.id);
      const selectedOption: McqCorrectOption | null = answer?.selectedOption ?? null;
      return { question: q, index: i, selectedOption, isMarked: answer?.isMarked ?? false, isCorrect: answer?.isCorrect ?? false, isSkipped: !answer?.selectedOption };
    }).filter((item) => {
      if (reviewFilter === 'correct') return item.isCorrect;
      if (reviewFilter === 'incorrect') return !item.isCorrect && !item.isSkipped;
      if (reviewFilter === 'skipped') return item.isSkipped;
      if (reviewFilter === 'marked') return item.isMarked;
      return true;
    });
  }, [result, questions, reviewFilter]);

  const filters: { key: ReviewFilter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'correct', label: 'Correct' },
    { key: 'incorrect', label: 'Incorrect' }, { key: 'skipped', label: 'Skipped' }, { key: 'marked', label: 'Marked' },
  ];

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
        <div><p className="text-base font-semibold text-neutral-800">No review data available</p><p className="mt-1 text-sm text-neutral-500">Complete a test to review your answers and explanations.</p></div>
        <div className="flex gap-3"><Button variant="outline" size="sm" onClick={() => navigate('/student/mcq')}><Home className="h-4 w-4" />Back to Tests</Button>{setSlug && <Button variant="primary" size="sm" onClick={() => navigate(`/student/mcq/${setSlug}`)}><RefreshCw className="h-4 w-4" />Start Test</Button>}</div>
      </div>
    );
  }

  if (loadingQuestions) { return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />))}</div>; }

  const incorrectCount = result.answers.filter((a) => !a.isCorrect && a.selectedOption !== null).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold text-neutral-900">Review Solutions</h1><p className="mt-0.5 text-sm text-neutral-500">{result.setTitle} | Score: {result.percentage}%</p></div><Link to={`/student/mcq/${setSlug}/result`} className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline"><ArrowLeft className="h-4 w-4" />Back to Results</Link></div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (<button key={f.key} onClick={() => setReviewFilter(f.key)} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors', reviewFilter === f.key ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50')}><Filter className="h-3.5 w-3.5" />{f.label}</button>))}
      </div>
      {filteredData.length > 0 ? (<div className="space-y-4">{filteredData.map((item) => (<McqReviewCard key={item.question.id} question={item.question} questionNumber={item.index + 1} selectedOption={item.selectedOption} isMarked={item.isMarked} />))}</div>) : (<div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center"><p className="text-sm text-neutral-500">No questions match this filter.</p></div>)}
      {incorrectCount > 0 && <div className="flex justify-center"><Button variant="primary" onClick={() => navigate(`/student/mcq/${setSlug}`)}><RefreshCw className="h-4 w-4" />Retry Incorrect Questions</Button></div>}
    </div>
  );
}
