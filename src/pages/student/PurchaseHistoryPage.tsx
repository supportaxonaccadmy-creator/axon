import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/payment/paymentService';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaymentStatusBadge, RefundStatusCard } from '@/components/student/payment';
import { formatCurrency, getPaymentMethodLabel } from '@/services/payment/paymentHelpers';
import { format } from 'date-fns';

interface PurchaseHistoryItem {
  id: string;
  batchId: string;
  batchTitle: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  gateway: string;
  paymentMethod: string | null;
  transactionReference: string | null;
  refundStatus: string;
  purchasedAt: string;
  paidAt: string | null;
}

export function PurchaseHistoryPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      try {
        const { data, error: err } = await paymentService.getStudentPurchasesWithDetails(user.id);
        if (err) { setError(err); setLoading(false); return; }
        setPurchases(data ?? []);
      } catch {
        setError('Failed to load purchase history');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <PageHeader title="Purchase History" description="View all your purchases and invoices" />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : purchases.length === 0 ? (
        <EmptyState title="No purchases yet" description="Your purchase history will appear here once you buy a course." icon={<ShoppingBag className="h-12 w-12" />} action={<Link to="/student/batches"><span className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Browse Batches</span></Link>} />
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{p.batchTitle}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                    <span>{format(new Date(p.purchasedAt), 'MMM d, yyyy')}</span>
                    <span className="capitalize">{p.gateway}</span>
                    {p.paymentMethod && <span>{getPaymentMethodLabel(p.paymentMethod)}</span>}
                    {p.transactionReference && <span className="font-mono">TXN: {p.transactionReference.slice(0, 16)}...</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-900">{formatCurrency(p.amount, p.currency)}</span>
                  <PaymentStatusBadge status={p.paymentStatus} />
                  <Link to={`/student/invoice/${p.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary-600 hover:bg-primary-50"><FileText className="h-3.5 w-3.5" />Invoice</Link>
                </div>
              </div>
              {p.refundStatus !== 'none' && <div className="mt-3"><RefundStatusCard refundStatus={p.refundStatus} refundId={null} /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
