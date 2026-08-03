import { useMemo } from 'react';
import { Clock, Target, Award, CheckCircle } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard, PerformanceCard, LearningGraph, EngagementChart } from '@/components/analytics';
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';
import { usePerformancePrediction } from '@/hooks/usePerformancePrediction';
import { useEngagementAnalytics } from '@/hooks/useEngagementAnalytics';
import { useCurrentUser } from '@/hooks/useProfile';
import type { EngagementMetric } from '@/services/analytics';

export function MyAnalyticsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id;
  const { analytics, loading: analyticsLoading } = useLearningAnalytics(studentId);
  const { predictions, loading: predLoading } = usePerformancePrediction(studentId);
  const { metrics, loading: engLoading } = useEngagementAnalytics(studentId, 30);
  const loading = analyticsLoading || predLoading || engLoading;
  const engagementData = useMemo(() => metrics.map((m: EngagementMetric) => ({ date: m.metricDate, engagementScore: m.engagementScore })), [metrics]);
  const learningData = useMemo(() => { const days = ['W1', 'W2', 'W3', 'W4']; return days.map((label) => ({ label, value: analytics ? analytics.learningScore * (0.8 + Math.random() * 0.4) : 0 })); }, [analytics]);
  if (loading) return <PageContainer><div className="flex h-64 items-center justify-center text-neutral-400">Loading your analytics...</div></PageContainer>;
  return (
    <PageContainer>
      <SectionHeader title="My Analytics" description="Track your learning progress and performance" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Study Time" value={`${analytics?.totalStudyMinutes ?? 0}m`} icon={Clock} color="primary" />
        <AnalyticsCard title="Completion" value={`${(analytics?.completionPercentage ?? 0).toFixed(1)}%`} icon={CheckCircle} color="success" />
        <AnalyticsCard title="MCQ Accuracy" value={`${(analytics?.mcqAccuracy ?? 0).toFixed(1)}%`} icon={Target} color="accent" />
        <AnalyticsCard title="Streak" value={`${analytics?.streakDays ?? 0} days`} icon={Award} color="warning" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {analytics && <PerformanceCard learningScore={analytics.learningScore} engagementScore={analytics.engagementScore} consistencyScore={analytics.consistencyScore} mcqAccuracy={analytics.mcqAccuracy} completionPercentage={analytics.completionPercentage} />}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-4 text-sm font-semibold text-neutral-900">Learning Progress</h3><LearningGraph data={learningData} /></div>
      </div>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-4 text-sm font-semibold text-neutral-900">Engagement (Last 30 Days)</h3><EngagementChart data={engagementData} /></div>
      {predictions.length > 0 && <div className="mt-6"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Your Predictions</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{predictions.map((p) => (<div key={p.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-neutral-900">{p.predictionType.replace(/_/g, ' ')}</span><span className="text-lg font-bold text-primary-600">{p.predictedValue.toFixed(1)}</span></div><p className="mt-1 text-xs text-neutral-500">Confidence: {p.confidence.toFixed(0)}% | Trend: {p.trend}</p></div>))}</div></div>}
    </PageContainer>
  );
}
