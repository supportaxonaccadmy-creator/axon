import { memo } from 'react';
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import type { TestSuite } from '@/services/testing';

interface RegressionCardProps { suites: TestSuite[]; }

function RegressionCardComponent({ suites }: RegressionCardProps) {
  const total = suites.reduce((acc, suite) => acc + suite.totalTests, 0);
  const passed = suites.reduce((acc, suite) => acc + suite.passedTests, 0);
  const failed = suites.reduce((acc, suite) => acc + suite.failedTests, 0);
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><RotateCcw className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Regression Tests</h3></div>
      <div className="mb-3 grid grid-cols-3 gap-3 text-xs"><div className="rounded-lg bg-neutral-50 p-2.5 text-center"><p className="text-lg font-bold text-neutral-900">{total}</p><p className="text-neutral-400">Total</p></div><div className="rounded-lg bg-success-50 p-2.5 text-center"><p className="text-lg font-bold text-success-700">{passed}</p><p className="text-success-400">Passed</p></div><div className="rounded-lg bg-error-50 p-2.5 text-center"><p className="text-lg font-bold text-error-700">{failed}</p><p className="text-error-400">Failed</p></div></div>
      <div className="space-y-1.5">{suites.map((suite) => (<div key={suite.id} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2">{suite.status === 'pass' ? <CheckCircle className="h-3.5 w-3.5 text-success-500" /> : <XCircle className="h-3.5 w-3.5 text-error-500" />}<span className="text-neutral-600">{suite.name}</span></div><span className="text-neutral-400">{suite.passedTests}/{suite.totalTests}</span></div>))}</div>
    </div>
  );
}
export const RegressionCard = memo(RegressionCardComponent);
