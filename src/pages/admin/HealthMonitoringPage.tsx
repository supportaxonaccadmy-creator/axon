import { memo, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { SystemHealthCard } from '@/components/monitoring';
import { useHealthMonitoring } from '@/hooks/useHealthMonitoring';

function HealthMonitoringPageComponent() {
  const { checks, runChecks, loading } = useHealthMonitoring();
  useEffect(() => { void runChecks(); }, [runChecks]);
  return (<PageContainer><SectionHeader title="Health Monitoring" description="Real-time health checks for all system components" />{loading && checks.length === 0 ? <p className="text-sm text-neutral-400">Running health checks...</p> : <SystemHealthCard checks={checks} />}</PageContainer>);
}
export const HealthMonitoringPage = memo(HealthMonitoringPageComponent);
