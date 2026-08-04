import { memo } from 'react';
import { Zap, CheckCircle, XCircle } from 'lucide-react';
import { qaService } from '@/services/testing';

function AutomationStatusCardComponent() {
  const suites = qaService.runRegressionTests();
  const total = suites.reduce((acc, suite) => acc + suite.totalTests, 0);
  const passed = suites.reduce((acc, suite) => acc + suite.passedTests, 0);
  const failed = suites.reduce((acc, suite) => acc + suite.failedTests, 0);
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Zap className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Automation Status</h3></div>
      <div className="grid grid-cols-3 gap-3 text-xs"><div className="rounded-lg bg-primary-50 p-2.5 text-center"><p className="text-lg font-bold text-primary-700">{total}</p><p className="text-primary-400">Automated</p></div><div className="rounded-lg bg-success-50 p-2.5 text-center"><p className="text-lg font-bold text-success-700">{passed}</p><p className="text-success-400">Passing</p></div><div className="rounded-lg bg-error-50 p-2.5 text-center"><p className="text-lg font-bold text-error-700">{failed}</p><p className="text-error-400">Failing</p></div></div>
      <div className="mt-3 flex items-center gap-2">{failed === 0 ? <CheckCircle className="h-5 w-5 text-success-500" /> : <XCircle className="h-5 w-5 text-error-500" />}<span className="text-sm font-medium text-neutral-700">{passRate}% automation pass rate</span></div>
    </div>
  );
}
export const AutomationStatusCard = memo(AutomationStatusCardComponent);
