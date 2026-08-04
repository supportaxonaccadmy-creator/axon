import { memo } from 'react';
import { FileText, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { TestReport } from '@/services/testing';

interface TestReportCardProps { report: TestReport | null; }

function TestReportCardComponent({ report }: TestReportCardProps) {
  if (!report) return null;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><FileText className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">{report.name}</h3></div><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${report.status === 'pass' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>{report.status.toUpperCase()}</span></div>
      <div className="mb-4 grid grid-cols-4 gap-3 text-xs"><div className="rounded-lg bg-neutral-50 p-2.5 text-center"><p className="text-lg font-bold text-neutral-900">{report.totalTests}</p><p className="text-neutral-400">Total</p></div><div className="rounded-lg bg-success-50 p-2.5 text-center"><p className="text-lg font-bold text-success-700">{report.passedTests}</p><p className="text-success-400">Passed</p></div><div className="rounded-lg bg-error-50 p-2.5 text-center"><p className="text-lg font-bold text-error-700">{report.failedTests}</p><p className="text-error-400">Failed</p></div><div className="rounded-lg bg-primary-50 p-2.5 text-center"><p className="text-lg font-bold text-primary-700">{report.coverage.overall}%</p><p className="text-primary-400">Coverage</p></div></div>
      <div className="mb-3 flex items-center gap-2 text-xs text-neutral-500"><Clock className="h-3 w-3" /> Generated: {new Date(report.timestamp).toLocaleString()} | Duration: {report.duration}ms</div>
      {report.failedModules.length > 0 && (<div className="mb-3 rounded-lg bg-error-50 p-2"><p className="mb-1 flex items-center gap-1 text-xs font-medium text-error-700"><XCircle className="h-3 w-3" /> Failed Modules</p>{report.failedModules.map((m) => <div key={m} className="text-xs text-error-600">{m}</div>)}</div>)}
      {report.recommendations.length > 0 && (<div className="rounded-lg bg-warning-50 p-2"><p className="mb-1 flex items-center gap-1 text-xs font-medium text-warning-700"><AlertTriangle className="h-3 w-3" /> Recommendations</p>{report.recommendations.map((r, i) => <div key={i} className="text-xs text-warning-600">{r}</div>)}</div>)}
    </div>
  );
}
export const TestReportCard = memo(TestReportCardComponent);
