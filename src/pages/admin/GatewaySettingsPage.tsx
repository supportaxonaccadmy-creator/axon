import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { GatewayConfig, TaxSettingsCard } from '@/components/finance';
function GatewaySettingsPageComponent() { return (<PageContainer><SectionHeader title="Gateway Settings" description="Configure payment gateways, currencies, and finance settings" /><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><GatewayConfig /><TaxSettingsCard /></div></PageContainer>); }
export const GatewaySettingsPage = memo(GatewaySettingsPageComponent);
