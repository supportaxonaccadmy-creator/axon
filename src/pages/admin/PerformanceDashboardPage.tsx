import { memo, useEffect, useState } from 'react';
import { Zap, Clock, Eye, Activity, TrendingUp } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard } from '@/components/analytics';
import { PerformanceCard, CacheStatusCard } from '@/components/pwa';
import { performanceService } from '@/services/pwa';

function PerformanceDashboardPageComponent() {
  const [metrics, setMetrics] = useState(performanceService.getMetrics());
  useEffect(() => {
    const timer = setTimeout(() => setMetrics(performanceService.measureAll()), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <PageContainer>
      <SectionHeader title="Performance Dashboard" description="Monitor app performance and optimization metrics" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Load Time" value={metrics.loadTime ? performanceService.formatMetric(metrics.loadTime) : '--'} icon={Clock} color="primary" />
        <AnalyticsCard title="First Contentful Paint" value={metrics.firstContentfulPaint ? performanceService.formatMetric(metrics.firstContentfulPaint) : '--'} icon={Eye} color="success" />
        <AnalyticsCard title="Largest Contentful Paint" value={metrics.largestContentfulPaint ? performanceService.formatMetric(metrics.largestContentfulPaint) : '--'} icon={Activity} color="accent" />
        <AnalyticsCard title="Time to Interactive" value={metrics.timeToInteractive ? performanceService.formatMetric(metrics.timeToInteractive) : '--'} icon={Zap} color="warning" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><PerformanceCard /><CacheStatusCard /></div>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><TrendingUp className="h-4 w-4 text-primary-500" /> Optimization Status</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Code splitting enabled with manual chunks</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Route-level lazy loading active</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Service worker caching configured</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Image optimization with lazy loading</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success-500" /> Background sync for offline data</li>
        </ul>
      </div>
    </PageContainer>
  );
}
export const PerformanceDashboardPage = memo(PerformanceDashboardPageComponent);
