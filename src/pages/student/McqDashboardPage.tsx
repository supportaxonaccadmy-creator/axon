import { useState, useMemo } from 'react';
import { HelpCircle, Award, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useMcqDashboard } from '@/hooks/useMcqDashboard';
import { McqSetCard } from '@/components/student/mcq/McqSetCard';
import { StudentDashboardSection } from '@/components/student/dashboard/StudentDashboardSection';
import { StudentDashboardGrid } from '@/components/student/dashboard/StudentDashboardGrid';
import { EmptyDashboard } from '@/components/student/dashboard/EmptyDashboard';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { StudentStatCard } from '@/components/student/dashboard/StudentStatCard';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

type Filter = 'all' | 'new' | 'completed' | 'pending';

export function McqDashboardPage() {
  const { data, loading, error, refresh } = useMcqDashboard();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filteredSets = useMemo(() => {
    if (!data?.availableSets) return [];
    let sets = data.availableSets;
    if (search) sets = sets.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'new') sets = sets.filter((s) => s.attemptsUsed === 0);
    if (filter === 'completed') sets = sets.filter((s) => s.attemptsUsed > 0);
    if (filter === 'pending') sets = sets.filter((s) => s.attemptsUsed === 0);
    return sets;
  }, [data, search, filter]);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: data?.availableSets.length ?? 0 },
    { key: 'new', label: 'New', count: data?.availableSets.filter((s) => s.attemptsUsed === 0).length ?? 0 },
    { key: 'completed', label: 'Completed', count: data?.availableSets.filter((s) => s.attemptsUsed > 0).length ?? 0 },
    { key: 'pending', label: 'Pending', count: data?.availableSets.filter((s) => s.attemptsUsed === 0).length ?? 0 },
  ];

  if (loading) return <DashboardLoadingSkeleton />;
  if (error) { return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3"><p className="text-sm text-error-700">{error}</p><button onClick={refresh} className="mt-2 text-xs text-primary-600 font-medium hover:underline">Retry</button></div>; }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-xl font-bold text-neutral-900">MCQ Practice</h1><p className="mt-0.5 text-sm text-neutral-500">Test your knowledge with practice tests and track your progress.</p></div>
      <StudentDashboardGrid cols={4}>
        <StudentStatCard label="Available Tests" value={data?.availableTests ?? 0} icon={HelpCircle} color="primary" />
        <StudentStatCard label="Completed" value={data?.completedTests ?? 0} icon={CheckCircle2} color="success" />
        <StudentStatCard label="Average Score" value={`${data?.averageScore ?? 0}%`} icon={TrendingUp} color="accent" />
        <StudentStatCard label="Best Score" value={`${data?.bestScore ?? 0}%`} icon={Award} color="warning" />
      </StudentDashboardGrid>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (<button key={f.key} onClick={() => setFilter(f.key)} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors', filter === f.key ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50')}><span>{f.label}</span><span className={cn('rounded-full px-1.5 py-0.5 text-xs', filter === f.key ? 'bg-white/20' : 'bg-neutral-100')}>{f.count}</span></button>))}
        </div>
        <div className="w-full sm:w-64"><Input type="text" placeholder="Search tests..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>
      <StudentDashboardSection title="Available Tests" description="Choose a test to start practicing">
        {filteredSets.length > 0 ? (<StudentDashboardGrid cols={3}>{filteredSets.map((set) => <McqSetCard key={set.id} set={set} />)}</StudentDashboardGrid>) : (<EmptyDashboard title={search ? 'No tests found' : 'No tests available'} description={search ? 'Try a different search term.' : 'MCQ tests will appear here once they are published.'} />)}
      </StudentDashboardSection>
      {data && data.recentAttempts.length > 0 && (
        <StudentDashboardSection title="Recent Attempts" description="Your latest practice results">
          <div className="space-y-2">
            {data.recentAttempts.slice(0, 5).map((attempt) => (
              <div key={attempt.attemptId} className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', attempt.hasPassed ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600')}>{attempt.hasPassed ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-800">{attempt.setTitle}</p><p className="text-xs text-neutral-500">{attempt.correctAnswers}/{attempt.totalQuestions} correct | {attempt.percentage}%</p></div>
                <span className="text-xs text-neutral-400">{new Date(attempt.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </StudentDashboardSection>
      )}
    </div>
  );
}
