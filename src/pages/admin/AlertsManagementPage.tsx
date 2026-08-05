import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AlertsPanel } from '@/components/monitoring';

function AlertsManagementPageComponent() {
  return (<PageContainer><SectionHeader title="Alerts Management" description="View, acknowledge, and resolve system alerts" /><AlertsPanel /></PageContainer>);
}
export const AlertsManagementPage = memo(AlertsManagementPageComponent);
