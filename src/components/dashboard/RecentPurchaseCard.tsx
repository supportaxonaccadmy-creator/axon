import { memo } from 'react';
import { format } from 'date-fns';
import { IndianRupee, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { RecentPurchase } from '@/types/adminDashboard';

interface RecentPurchaseCardProps { purchases: RecentPurchase[]; loading?: boolean; }

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-success-600 bg-success-50', label: 'Completed' },
  pending: { icon: Clock, color: 'text-warning-600 bg-warning-50', label: 'Pending' },
  failed: { icon: XCircle, color: 'text-error-600 bg-error-50', label: 'Failed' },
  refunded: { icon: XCircle, color: 'text-neutral-600 bg-neutral-100', label: 'Refunded' },
};

function RecentPurchaseCardComponent({ purchases, loading = false }: RecentPurchaseCardProps) {
  if (loading) return <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (purchases.length === 0) return <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center"><p className="text-sm text-neutral-500">No recent purchases</p></div>;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Recent Purchases</h3>
      <div className="mt-3 space-y-2">{purchases.map((p) => {
        const config = STATUS_CONFIG[p.paymentStatus] ?? STATUS_CONFIG.pending!; const Icon = config.icon;
        return (
          <div key={p.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50">
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.color)}><Icon className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-800">{p.studentName}</p><p className="truncate text-xs text-neutral-500">{p.batchTitle}</p></div>
            <div className="flex shrink-0 flex-col items-end gap-0.5"><span className="flex items-center text-sm font-bold text-neutral-900"><IndianRupee className="h-3 w-3" />{p.amount.toLocaleString('en-IN')}</span><span className="text-[10px] text-neutral-400">{p.purchasedAt ? format(new Date(p.purchasedAt), 'MMM d') : ''}</span></div>
          </div>
        );
      })}</div>
    </div>
  );
}

export const RecentPurchaseCard = memo(RecentPurchaseCardComponent);
