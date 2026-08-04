import { memo, useState, useCallback } from 'react';
import { FlaskConical, Play, Loader, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useTesting } from '@/hooks/useTesting';

function TestingDashboardComponent() {
  const { suites, loading, totalTests, passedTests, failedTests, duration, runAllTests } = useTesting();
  const [hasRun, setHasRun] = useState(false);
  const handleRun = useCallback(() => { void runAllTests(); setHasRun(true); }, [runAllTests]);
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const statusIcon = !hasRun ? <AlertTriangle className="h-5 w-5 text-neutral-400" /> : failedTests === 0 ? <CheckCircle className="h-5 w-5 text-success-500" /> : <XCircle className="h-5 w-5 text-error-500" />;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><FlaskConical className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Testing Dashboard</h3></div>
        <button onClick={handleRun} disabled={loading} className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50">{loading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Run All Tests</button>
      </div>
      {hasRun && (<div className="mb-4 grid grid-cols-4 gap-3 text-xs"><div className="rounded-lg bg-neutral-50 p-3 text-center"><p className="text-lg font-bold text-neutral-900">{totalTests}</p><p className="text-neutral-400">Total</p></div><div className="rounded-lg bg-success-50 p-3 text-center"><p className="text-lg font-bold text-success-700">{passedTests}</p><p className="text-success-400">Passed</p></div><div className="rounded-lg bg-error-50 p-3 text-center"><p className="text-lg font-bold text-error-700">{failedTests}</p><p className="text-error-400">Failed</p></div><div className="rounded-lg bg-primary-50 p-3 text-center"><p className="text-lg font-bold text-primary-700">{passRate}%</p><p className="text-primary-400">Pass Rate</p></div></div>)}
      <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-3">{statusIcon}<span className="text-sm font-medium text-neutral-700">{!hasRun ? 'No tests run yet. Click "Run All Tests" to begin.' : failedTests === 0 ? `All ${totalTests} tests passed in ${duration}ms` : `${failedTests} tests failed out of ${totalTests}`}</span></div>
      {suites.length > 0 && (<div className="mt-4 space-y-2">{suites.map((suite) => (<div key={suite.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-2.5"><div className="flex items-center gap-2">{suite.status === 'pass' ? <CheckCircle className="h-4 w-4 text-success-500" /> : <XCircle className="h-4 w-4 text-error-500" />}<span className="text-sm font-medium text-neutral-700">{suite.name}</span></div><span className="text-xs text-neutral-400">{suite.passedTests}/{suite.totalTests} passed | {suite.duration}ms</span></div>))}</div>)}
    </div>
  );
}
export const TestingDashboard = memo(TestingDashboardComponent);
