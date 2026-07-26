import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { RefreshCw, Eye, Home } from 'lucide-react';
import { McqResultSummary } from '@/components/student/mcq/McqResultSummary';
import { Button } from '@/components/ui/Button';
import type { McqAttemptResult } from '@/types/mcqPractice';

export function McqResultPage() {
  const { setSlug } = useParams<{ setSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const result = (location.state as { result: McqAttemptResult | null } | null)?.result ?? null;

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
        <div><p className="text-base font-semibold text-neutral-800">No result data available</p><p className="mt-1 text-sm text-neutral-500">Your test result could not be loaded. This may happen if you navigated directly to this page.</p></div>
        <div className="flex gap-3"><Button variant="outline" size="sm" onClick={() => navigate('/student/mcq')}><Home className="h-4 w-4" />Back to Tests</Button>{setSlug && <Button variant="primary" size="sm" onClick={() => navigate(`/student/mcq/${setSlug}`)}><RefreshCw className="h-4 w-4" />Retry Test</Button>}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold text-neutral-900">Test Results</h1><p className="mt-0.5 text-sm text-neutral-500">{result.setTitle}</p></div></div>
      <McqResultSummary result={result} />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" onClick={() => navigate(`/student/mcq/${setSlug}/review`)}><Eye className="h-4 w-4" />Review Solutions</Button>
        <Button variant="primary" onClick={() => navigate(`/student/mcq/${setSlug}`)}><RefreshCw className="h-4 w-4" />Retry Test</Button>
        <Button variant="ghost" onClick={() => navigate('/student/mcq')}>Back to Tests</Button>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-800">Rank</h3>
        <div className="mt-3 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100"><span className="text-lg font-bold text-neutral-400">--</span></div><div><p className="text-sm font-medium text-neutral-700">Rank not available yet</p><p className="text-xs text-neutral-400">Leaderboard rankings will be available once more students attempt this test.</p></div></div>
      </div>
    </div>
  );
}
