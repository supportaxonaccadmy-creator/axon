import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { PerformanceTestCard } from '@/components/testing';

function PerformanceTestingPageComponent() { return (<PageContainer><SectionHeader title="Performance Testing" description="Page load, API response, and bundle size metrics" /><PerformanceTestCard /></PageContainer>); }
export const PerformanceTestingPage = memo(PerformanceTestingPageComponent);
