import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { TaxSettingsCard } from '@/components/finance';
function TaxSettingsPageComponent() { return (<PageContainer><SectionHeader title="Tax Settings" description="Configure GST, CGST, SGST, and IGST rates" /><TaxSettingsCard /></PageContainer>); }
export const TaxSettingsPage = memo(TaxSettingsPageComponent);
