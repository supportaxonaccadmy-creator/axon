import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { HealthDashboard, DatabaseHealthCard, StorageHealthCard } from '@/components/devops';

function SystemHealthPageComponent() { return (<PageContainer><SectionHeader title="System Health" description="Real-time health monitoring for all system components" /><div className="mb-6"><HealthDashboard /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><DatabaseHealthCard /><StorageHealthCard /></div></PageContainer>); }
export const SystemHealthPage = memo(SystemHealthPageComponent);
