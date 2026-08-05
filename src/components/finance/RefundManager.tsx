import { memo, useEffect } from 'react';
import { RotateCcw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useRefunds } from '@/hooks/useRefunds';
import type { Refund } from '@/services/finance';

interface RefundManagerProps { profileId?: string | undefined; }

function RefundManagerComponent({ profileId }: RefundManagerProps) {
  const { refunds, loading, refresh } = useRefunds(profileId);
  useEffect(() => { void refresh(); }, [refresh]);
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><RotateCcw className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Refund Management</h3></div><div className="space-y-2">{refunds.map((refund: Refund) => (<div key={refund.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 text-xs"><div className="flex items-center gap-2">{refund.status === 'completed' ? <CheckCircle className="h-4 w-4 text-success-500" /> : refund.status === 'pending' ? <Clock className="h-4 w-4 text-warning-500" /> : <XCircle className="h-4 w-4 text-error-500" />}<div><p className="font-medium text-neutral-700">₹{refund.amount} — {refund.refundType}</p><p className="text-neutral-400">{refund.reason ?? 'No reason provided'}</p><p className="text-neutral-400">{new Date(refund.createdAt).toLocaleString()}</p></div></div><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${refund.status === 'completed' ? 'bg-success-50 text-success-700' : refund.status === 'pending' ? 'bg-warning-50 text-warning-700' : 'bg-error-50 text-error-700'}`}>{refund.status}</span></div>))}{refunds.length === 0 && !loading && <p className="text-sm text-neutral-400">No refunds recorded.</p>}</div></div>);
}
export const RefundManager = memo(RefundManagerComponent);
