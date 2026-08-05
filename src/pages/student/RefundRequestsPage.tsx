import { memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { RefundManager } from '@/components/finance';
function RefundRequestsPageComponent() { const { user } = useAuth(); return (<PageContainer><SectionHeader title="Refund Requests" description="View your refund requests and status" /><RefundManager profileId={user?.id ?? undefined} /></PageContainer>); }
export const RefundRequestsPage = memo(RefundRequestsPageComponent);
