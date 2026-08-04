import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { ActiveSessionsCard } from '@/components/security';

function ActiveSessionsPageComponent() {
  return (<PageContainer><SectionHeader title="Active Sessions" description="Manage active device sessions" /><div className="mx-auto max-w-2xl"><ActiveSessionsCard /></div></PageContainer>);
}
export const ActiveSessionsPage = memo(ActiveSessionsPageComponent);
