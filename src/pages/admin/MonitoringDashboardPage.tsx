import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { MonitoringDashboard, MetricsCard, UptimeCard, AlertsPanel } from '@/components/monitoring';

function MonitoringDashboardPageComponent() {
  return (<PageContainer><SectionHeader title="Monitoring Dashboard" description="Enterprise monitoring and observability overview" /><div className="mb-6"><MonitoringDashboard /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><MetricsCard /><UptimeCard /></div><div className="mt-4"><AlertsPanel /></div></PageContainer>);
}
export const MonitoringDashboardPage = memo(MonitoringDashboardPageComponent);
