import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { EnvironmentStatusCard, HealthDashboard, BuildInformationCard, ProductionChecklist, VersionCard } from '@/components/devops';

function ProductionDashboardPageComponent() {
  return (<PageContainer><SectionHeader title="Production Dashboard" description="Monitor production readiness, environment status, and system health" /><div className="mb-6"><ProductionChecklist /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><EnvironmentStatusCard /><HealthDashboard /></div><div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2"><BuildInformationCard /><VersionCard /></div></PageContainer>);
}
export const ProductionDashboardPage = memo(ProductionDashboardPageComponent);
