import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { LogsViewer, MonitoringTimeline } from '@/components/monitoring';

function SystemLogsPageComponent() {
  return (<PageContainer><SectionHeader title="System Logs" description="Application logs, audit events, and monitoring timeline" /><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><LogsViewer /><MonitoringTimeline /></div></PageContainer>);
}
export const SystemLogsPage = memo(SystemLogsPageComponent);
