import { memo, useState, useCallback } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { TestReportCard, CoverageCard, RegressionCard } from '@/components/testing';
import { useTestReports } from '@/hooks/useTestReports';
import { useQA } from '@/hooks/useQA';
import { qaService } from '@/services/testing';

function QAReportsPageComponent() {
  const { report, summary, loading, generateReport } = useTestReports();
  const { runRegressionTests } = useQA();
  const [regressionSuites] = useState(runRegressionTests());
  const handleGenerate = useCallback(() => { generateReport(); }, [generateReport]);
  return (<PageContainer><SectionHeader title="QA Reports" description="Enterprise quality assurance reports and coverage" /><div className="mb-4 flex justify-end"><button onClick={handleGenerate} disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Generating...' : 'Generate Report'}</button></div>{report && <div className="mb-6"><TestReportCard report={report} /></div>}{report && <div className="mb-6"><CoverageCard coverage={report.coverage} /></div>}<div className="mb-6"><RegressionCard suites={regressionSuites.length > 0 ? regressionSuites : qaService.runRegressionTests()} /></div>{summary && (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Report Summary</h3><pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs text-neutral-600">{summary}</pre></div>)}</PageContainer>);
}
export const QAReportsPage = memo(QAReportsPageComponent);
