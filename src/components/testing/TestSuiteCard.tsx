import { memo } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { TestSuite } from '@/services/testing';

interface TestSuiteCardProps { suite: TestSuite; }

function TestSuiteCardComponent({ suite }: TestSuiteCardProps) {
  const passRate = suite.totalTests > 0 ? Math.round((suite.passedTests / suite.totalTests) * 100) : 0;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">{suite.status === 'pass' ? <CheckCircle className="h-5 w-5 text-success-500" /> : <XCircle className="h-5 w-5 text-error-500" />}<h3 className="text-sm font-semibold text-neutral-900">{suite.name}</h3></div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${suite.status === 'pass' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>{passRate}%</span>
      </div>
      <div className="mb-3 flex items-center gap-4 text-xs text-neutral-500"><span>{suite.passedTests} passed</span><span className="text-error-500">{suite.failedTests} failed</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {suite.duration}ms</span></div>
      <div className="space-y-1">{suite.tests.map((test) => (<div key={test.id} className="flex items-center gap-2 text-xs">{test.status === 'pass' ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-success-500" /> : <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-error-500" />}<span className="text-neutral-600">{test.name}</span><span className="ml-auto text-neutral-400">{test.duration}ms</span></div>))}</div>
    </div>
  );
}
export const TestSuiteCard = memo(TestSuiteCardComponent);
