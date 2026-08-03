import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { PredictionCard, AnalyticsCard } from '@/components/analytics';
import { usePerformancePrediction } from '@/hooks/usePerformancePrediction';
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';
import { useCurrentUser } from '@/hooks/useProfile';

export function PerformancePredictionPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id;
  const { predictions, loading: predLoading } = usePerformancePrediction(studentId);
  const { analytics, loading: analyticsLoading } = useLearningAnalytics(studentId);
  const loading = predLoading || analyticsLoading;
  if (loading) return <PageContainer><div className="flex h-64 items-center justify-center text-neutral-400">Loading predictions...</div></PageContainer>;
  return (
    <PageContainer>
      <SectionHeader title="Performance Prediction" description="AI-powered predictions for your academic performance" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Learning Score" value={(analytics?.learningScore ?? 0).toFixed(1)} icon={Brain} color="primary" />
        <AnalyticsCard title="Consistency" value={`${(analytics?.consistencyScore ?? 0).toFixed(1)}%`} icon={TrendingUp} color="success" />
        <AnalyticsCard title="Drop Risk" value={`${predictions.find((p) => p.predictionType === 'drop_risk')?.predictedValue.toFixed(0) ?? 0}%`} icon={AlertTriangle} color="error" />
        <AnalyticsCard title="Expected Score" value={`${predictions.find((p) => p.predictionType === 'expected_score')?.predictedValue.toFixed(0) ?? 0}%`} icon={Target} color="accent" />
      </div>
      <div className="mt-6"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Detailed Predictions</h3>
        {predictions.length === 0 ? <div className="flex h-40 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400">No predictions available yet. Keep studying to generate AI predictions!</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{predictions.map((p) => <PredictionCard key={p.id} prediction={p} />)}</div>}
      </div>
    </PageContainer>
  );
}
