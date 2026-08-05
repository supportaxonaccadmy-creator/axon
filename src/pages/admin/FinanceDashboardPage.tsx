import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { FinanceDashboard } from '@/components/finance';
function FinanceDashboardPageComponent() { return (<PageContainer><SectionHeader title="Finance Dashboard" description="Revenue, sales, refunds, coupons, and gateway statistics" /><FinanceDashboard /></PageContainer>); }
export const FinanceDashboardPage = memo(FinanceDashboardPageComponent);
