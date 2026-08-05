import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { ErrorTrackingCard } from '@/components/monitoring';

function ErrorTrackingPageComponent() {
  return (<PageContainer><SectionHeader title="Error Tracking" description="Track, monitor, and resolve application errors" /><ErrorTrackingCard /></PageContainer>);
}
export const ErrorTrackingPage = memo(ErrorTrackingPageComponent);
