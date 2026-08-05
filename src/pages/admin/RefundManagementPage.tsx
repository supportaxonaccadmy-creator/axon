import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { RefundManager } from '@/components/finance';
function RefundManagementPageComponent() { return (<PageContainer><SectionHeader title="Refund Management" description="Process and track refunds" /><RefundManager /></PageContainer>); }
export const RefundManagementPage = memo(RefundManagementPageComponent);
