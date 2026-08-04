import { memo } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { qaService } from '@/services/testing';

function TestingTimelineComponent() {
  const suites = qaService.runRegressionTests();
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Clock className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Testing Timeline</h3></div>
      <div className="relative space-y-3 before:absolute before:left-2 before:top-0 before:h-full before:w-px before:bg-neutral-200">{suites.map((suite) => (<div key={suite.id} className="relative pl-8"><div className={`absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${suite.status === 'pass' ? 'border-success-500 bg-white' : 'border-error-500 bg-white'}`}>{suite.status === 'pass' ? <CheckCircle className="h-3 w-3 text-success-500" /> : <XCircle className="h-3 w-3 text-error-500" />}</div><div className="flex items-center gap-2"><span className="text-xs font-medium text-neutral-700">{suite.name}</span><span className="text-xs text-neutral-400">{suite.duration}ms</span><span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${suite.status === 'pass' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>{suite.passedTests}/{suite.totalTests}</span></div></div>))}</div>
    </div>
  );
}
export const TestingTimeline = memo(TestingTimelineComponent);
