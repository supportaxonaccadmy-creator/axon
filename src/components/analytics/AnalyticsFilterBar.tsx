import { memo } from 'react';

interface AnalyticsFilterBarProps { period: '7d' | '30d' | '90d' | 'all'; onPeriodChange: (period: '7d' | '30d' | '90d' | 'all') => void; batchId?: string; onBatchChange?: (batchId: string) => void; batches?: Array<{ id: string; title: string }>; }
const PERIODS: Array<{ value: '7d' | '30d' | '90d' | 'all'; label: string }> = [{ value: '7d', label: '7 Days' }, { value: '30d', label: '30 Days' }, { value: '90d', label: '90 Days' }, { value: 'all', label: 'All Time' }];

function AnalyticsFilterBarComponent({ period, onPeriodChange, batchId, onBatchChange, batches }: AnalyticsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2"><span className="text-xs font-medium text-neutral-500">Period:</span>
        <div className="flex gap-1">{PERIODS.map((p) => (<button key={p.value} onClick={() => onPeriodChange(p.value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${period === p.value ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{p.label}</button>))}</div>
      </div>
      {batches && batches.length > 0 && onBatchChange && (
        <div className="flex items-center gap-2"><span className="text-xs font-medium text-neutral-500">Batch:</span>
          <select value={batchId ?? ''} onChange={(e) => onBatchChange(e.target.value)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700"><option value="">All Batches</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}</select>
        </div>
      )}
    </div>
  );
}
export const AnalyticsFilterBar = memo(AnalyticsFilterBarComponent);
