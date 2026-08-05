import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { WalletCard, InvoiceViewer, RefundManager } from '@/components/finance';
function WalletManagementPageComponent() { return (<PageContainer><SectionHeader title="Wallet Management" description="Student wallet balances and transactions" /><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><WalletCard profileId={null} /><InvoiceViewer /></div><div className="mt-4"><RefundManager /></div></PageContainer>); }
export const WalletManagementPage = memo(WalletManagementPageComponent);
