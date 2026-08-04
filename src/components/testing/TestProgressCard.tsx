import { memo } from 'react';
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface TestProgressCardProps { total: number; passed: number; failed: number; duration: number; loading: boolean; }

function TestProgressCardComponent({ total, passed, failed, duration, loading }: TestProgressCardProps) {
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><TrendingUp className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Test Progress</h3></div>
      <div className="mb-4"><div className="flex items-center justify-between text-xs text-neutral-500"><span>Pass Rate</span><span>{passed}/{total}</span></div><div className="mt-1 h-3 overflow-hidden rounded-full bg-neutral-100"><div className={`h-full rounded-full transition-all ${passRate === 100 ? 'bg-success-500' : passRate >= 80 ? 'bg-warning-500' : 'bg-error-500'}`} style={{ width: `${passRate}%` }} /></div></div>
      <div className="grid grid-cols-3 gap-3 text-xs"><div className="flex items-center gap-1.5 rounded-lg bg-success-50 p-2.5"><CheckCircle className="h-4 w-4 text-success-500" /><div><p className="font-bold text-success-700">{passed}</p><p className="text-success-400">Passed</p></div></div><div className="flex items-center gap-1.5 rounded-lg bg-error-50 p-2.5"><XCircle className="h-4 w-4 text-error-500" /><div><p className="font-bold text-error-700">{failed}</p><p className="text-error-400">Failed</p></div></div><div className="rounded-lg bg-neutral-50 p-2.5"><p className="font-bold text-neutral-700">{duration}ms</p><p className="text-neutral-400">Duration</p></div></div>
      {loading && <p className="mt-3 text-xs text-primary-600">Running tests...</p>}
    </div>
  );
}
export const TestProgressCard = memo(TestProgressCardComponent);
