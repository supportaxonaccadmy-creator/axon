import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { BackupStatusCard } from '@/components/devops';

function BackupManagementPageComponent() { return (<PageContainer><SectionHeader title="Backup Management" description="Backup strategy, restore procedures, and disaster recovery" /><BackupStatusCard /></PageContainer>); }
export const BackupManagementPage = memo(BackupManagementPageComponent);
