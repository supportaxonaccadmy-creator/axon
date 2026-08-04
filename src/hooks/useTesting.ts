import { useState, useCallback } from 'react';
import { unitTestingService, integrationTestingService, e2eTestingService, apiTestingService, databaseTestingService } from '@/services/testing';
import type { TestSuite } from '@/services/testing';

export function useTesting() {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);

  const runUnitTests = useCallback(() => { setLoading(true); const results = unitTestingService.runAllUnitTests(); setSuites(results); setLoading(false); return results; }, []);
  const runIntegrationTests = useCallback(() => { setLoading(true); const results = integrationTestingService.runAllIntegrationTests(); setSuites(results); setLoading(false); return results; }, []);
  const runE2ETests = useCallback(() => { setLoading(true); const results = e2eTestingService.runAllE2ETests(); setSuites(results); setLoading(false); return results; }, []);
  const runAPITests = useCallback(() => { setLoading(true); const results = apiTestingService.runAllAPITests(); setSuites(results); setLoading(false); return results; }, []);
  const runDatabaseTests = useCallback(() => { setLoading(true); const results = databaseTestingService.runAllDatabaseTests(); setSuites(results); setLoading(false); return results; }, []);
  const runAllTests = useCallback(() => {
    setLoading(true);
    const all = [
      ...unitTestingService.runAllUnitTests(),
      ...integrationTestingService.runAllIntegrationTests(),
      ...e2eTestingService.runAllE2ETests(),
      ...apiTestingService.runAllAPITests(),
      ...databaseTestingService.runAllDatabaseTests(),
    ];
    setSuites(all); setLoading(false); return all;
  }, []);

  const totalTests = suites.reduce((acc, s) => acc + s.totalTests, 0);
  const passedTests = suites.reduce((acc, s) => acc + s.passedTests, 0);
  const failedTests = suites.reduce((acc, s) => acc + s.failedTests, 0);
  const duration = suites.reduce((acc, s) => acc + s.duration, 0);

  return { suites, loading, totalTests, passedTests, failedTests, duration, runUnitTests, runIntegrationTests, runE2ETests, runAPITests, runDatabaseTests, runAllTests };
}
