import { useState, useCallback } from 'react';
import { testReportService, qaService } from '@/services/testing';
import type { TestReport } from '@/services/testing';

export function useTestReports() {
  const [report, setReport] = useState<TestReport | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = useCallback(() => {
    setLoading(true);
    const suites = qaService.runRegressionTests();
    const rpt = testReportService.generateReport('Enterprise QA Report', suites);
    setReport(rpt); setSummary(testReportService.generateSummaryReport(rpt)); setLoading(false);
    return rpt;
  }, []);

  const generateCoverageReport = useCallback(() => {
    setLoading(true);
    const rpt = testReportService.generateReport('Coverage Report', qaService.runRegressionTests());
    setReport(rpt); setSummary(testReportService.generateSummaryReport(rpt)); setLoading(false);
    return rpt;
  }, []);

  return { report, summary, loading, generateReport, generateCoverageReport };
}
