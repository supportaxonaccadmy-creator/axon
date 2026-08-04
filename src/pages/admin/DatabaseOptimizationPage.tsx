import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { DatabaseHealthCard } from '@/components/devops';

function DatabaseOptimizationPageComponent() { return (<PageContainer><SectionHeader title="Database Optimization" description="Monitor database health, indexes, and optimization suggestions" /><DatabaseHealthCard /></PageContainer>); }
export const DatabaseOptimizationPage = memo(DatabaseOptimizationPageComponent);
