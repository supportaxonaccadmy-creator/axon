import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { InvoiceViewer } from '@/components/finance';
function InvoiceManagementPageComponent() { return (<PageContainer><SectionHeader title="Invoice Management" description="View and manage all invoices" /><InvoiceViewer /></PageContainer>); }
export const InvoiceManagementPage = memo(InvoiceManagementPageComponent);
