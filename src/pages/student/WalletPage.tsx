import { memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { WalletCard } from '@/components/finance';
function WalletPageComponent() { const { user } = useAuth(); return (<PageContainer><SectionHeader title="My Wallet" description="Wallet balance, recharge, and transaction history" /><WalletCard profileId={user?.id ?? null} /></PageContainer>); }
export const WalletPage = memo(WalletPageComponent);
