import { memo, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { TestingDashboard, AutomationStatusCard, ModuleHealthCard, TestingTimeline } from '@/components/testing';
import { useQA } from '@/hooks/useQA';

function TestingDashboardPageComponent() {
  const { moduleHealth, refreshModuleHealth } = useQA();
  useEffect(() => { refreshModuleHealth(); }, [refreshModuleHealth]);
  return (<PageContainer><SectionHeader title="Testing Dashboard" description="Enterprise testing and quality assurance overview" /><div className="mb-6"><TestingDashboard /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><AutomationStatusCard /><ModuleHealthCard modules={moduleHealth} /></div><div className="mt-4"><TestingTimeline /></div></PageContainer>);
}
export const TestingDashboardPage = memo(TestingDashboardPageComponent);
