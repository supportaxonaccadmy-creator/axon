import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { PermissionTable } from '@/components/security';

function PermissionManagementPageComponent() {
  return (<PageContainer><SectionHeader title="Permission Management" description="View and manage role-based permissions" /><PermissionTable /></PageContainer>);
}
export const PermissionManagementPage = memo(PermissionManagementPageComponent);
