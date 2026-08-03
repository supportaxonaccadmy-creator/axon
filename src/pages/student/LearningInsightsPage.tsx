import { useMemo } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard, PerformanceCard, EngagementChart } from '@/components/analytics';
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';
import { useEngagementAnalytics } from '@/hooks/useEngagementAnalytics';
import { useRetentionAnalytics } from '@/hooks/useRetentionAnalytics';
import { useCurrentUser } from '@/hooks/useProfile';
import type { EngagementMetric } from '@/services/analytics';

export function LearningInsightsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id;
  const { analytics, loading: analyticsLoading } = useLearningAnalytics(studentId);
  const { metrics, loading: engLoading } = useEngagementAnalytics(studentId, 30);
  const { retention, loading: retLoading } = useRetentionAnalytics(studentId);
  const loading = analyticsLoading || engLoading || retLoading;
  const engagementData = useMemo(() => metrics.map((m: EngagementMetric) => ({ date: m.metricDate, engagementScore: m.engagementScore })), [metrics]);
  if (loading) return <PageContainer><div className="flex h-64 items-center justify-center text-neutral-400">Loading insights...</div></PageContainer>;
  return (
    <PageContainer>
      <SectionHeader title="Learning Insights" description="Deep insights into your learning patterns" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Engagement Score" value={(analytics?.engagementScore ?? 0).toFixed(1)} icon={TrendingUp} color="primary" />
        <AnalyticsCard title="Consistency" value={`${(analytics?.consistencyScore ?? 0).toFixed(1)}%`} icon={CheckCircle} color="success" />
        <AnalyticsCard title="Video Completion" value={`${(analytics?.videoCompletionPercentage ?? 0).toFixed(1)}%`} icon={CheckCircle} color="accent" />
        <AnalyticsCard title="Attendance" value={`${(analytics?.attendancePercentage ?? 0).toFixed(1)}%`} icon={CheckCircle} color="warning" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {analytics && <PerformanceCard learningScore={analytics.learningScore} engagementScore={analytics.engagementScore} consistencyScore={analytics.consistencyScore} mcqAccuracy={analytics.mcqAccuracy} completionPercentage={analytics.completionPercentage} />}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-4 text-sm font-semibold text-neutral-900">Engagement (30 Days)</h3><EngagementChart data={engagementData} /></div>
      </div>
      {retention && <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><AlertTriangle className="h-4 w-4 text-warning-500" /> Retention Status</h3><div className="flex items-center justify-between"><div><p className="text-lg font-bold text-neutral-900">{retention.retentionStatus.charAt(0).toUpperCase() + retention.retentionStatus.slice(1)}</p><p className="text-xs text-neutral-500">Days active: {retention.daysActive} | Last activity: {retention.daysSinceLastActivity} days ago</p></div><div className="text-right"><p className="text-lg font-bold text-neutral-900">{retention.churnProbability.toFixed(0)}%</p><p className="text-xs text-neutral-500">Churn Probability</p></div></div></div>}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-primary-50 p-5"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-900"><Lightbulb className="h-4 w-4" /> AI Recommendations</h3><ul className="space-y-1 text-sm text-primary-700"><li>Maintain a consistent daily study schedule to improve your consistency score.</li><li>Focus on completing videos you've started to boost your completion rate.</li><li>Practice more MCQs to improve your accuracy and predicted exam score.</li></ul></div>
    </PageContainer>
  );
}
