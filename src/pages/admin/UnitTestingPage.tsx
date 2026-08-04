import { memo, useState, useCallback } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { TestSuiteCard, TestProgressCard } from '@/components/testing';
import { unitTestingService } from '@/services/testing';
import type { TestSuite } from '@/services/testing';

function UnitTestingPageComponent() {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);
  const handleRun = useCallback(() => { setLoading(true); const results = unitTestingService.runAllUnitTests(); setSuites(results); setLoading(false); }, []);
  const total = suites.reduce((acc, su) => acc + su.totalTests, 0);
  const passed = suites.reduce((acc, su) => acc + su.passedTests, 0);
  const failed = suites.reduce((acc, su) => acc + su.failedTests, 0);
  const duration = suites.reduce((acc, su) => acc + su.duration, 0);
  return (<PageContainer><SectionHeader title="Unit Testing" description="Individual component and function tests" /><div className="mb-4 flex justify-end"><button onClick={handleRun} disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Running...' : 'Run Unit Tests'}</button></div>{suites.length > 0 && <div className="mb-6"><TestProgressCard total={total} passed={passed} failed={failed} duration={duration} loading={loading} /></div>}<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{suites.map((suite) => <TestSuiteCard key={suite.id} suite={suite} />)}</div></PageContainer>);
}
export const UnitTestingPage = memo(UnitTestingPageComponent);
