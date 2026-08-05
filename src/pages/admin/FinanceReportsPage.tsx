import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { FinanceDashboard } from '@/components/finance';
function FinanceReportsPageComponent() { return (<PageContainer><SectionHeader title="Finance Reports" description="Revenue, GST, coupon, refund, and sales reports" /><FinanceDashboard /></PageContainer>); }
export const FinanceReportsPage = memo(FinanceReportsPageComponent);
