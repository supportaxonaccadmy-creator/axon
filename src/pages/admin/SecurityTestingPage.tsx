import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { SecurityTestCard } from '@/components/testing';

function SecurityTestingPageComponent() { return (<PageContainer><SectionHeader title="Security Testing" description="Authentication, authorization, RLS, and input validation tests" /><SecurityTestCard /></PageContainer>); }
export const SecurityTestingPage = memo(SecurityTestingPageComponent);
