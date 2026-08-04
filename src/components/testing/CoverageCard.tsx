import { memo } from 'react';
import { PieChart } from 'lucide-react';
import type { TestCoverage } from '@/services/testing';

interface CoverageCardProps { coverage: TestCoverage | null; }

function CoverageCardComponent({ coverage }: CoverageCardProps) {
  if (!coverage) return null;
  const moduleEntries = Object.entries(coverage.byModule);
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><PieChart className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Test Coverage</h3><span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${coverage.overall === 100 ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>{coverage.overall}%</span></div>
      <div className="space-y-1.5">{moduleEntries.map(([module, pct]) => (<div key={module} className="flex items-center gap-2"><span className="w-32 truncate text-xs text-neutral-600">{module}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100"><div className={`h-full rounded-full ${pct === 100 ? 'bg-success-500' : pct >= 80 ? 'bg-warning-500' : 'bg-error-500'}`} style={{ width: `${pct}%` }} /></div><span className="w-10 text-right text-xs font-mono text-neutral-500">{pct}%</span></div>))}</div>
    </div>
  );
}
export const CoverageCard = memo(CoverageCardComponent);
