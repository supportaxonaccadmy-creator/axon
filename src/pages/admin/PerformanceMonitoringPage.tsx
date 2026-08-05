import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { PerformanceCard } from '@/components/monitoring';

function PerformanceMonitoringPageComponent() {
  return (<PageContainer><SectionHeader title="Performance Monitoring" description="Page load, API response, database, and rendering metrics" /><PerformanceCard /></PageContainer>);
}
export const PerformanceMonitoringPage = memo(PerformanceMonitoringPageComponent);
