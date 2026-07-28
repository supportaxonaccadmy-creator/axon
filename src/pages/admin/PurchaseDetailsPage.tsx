import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, CreditCard, Calendar, Hash, DollarSign, RotateCcw } from 'lucide-react';
import { purchaseService } from '@/services/lms/purchaseService';
import { batchService } from '@/services/lms/batchService';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { PurchaseStatusBadge } from '@/components/admin/students';
import { ConfirmDialog } from '@/components/admin/common';
import { format } from 'date-fns';
import type { Purchase, Batch } from '@/types/lms';

export function PurchaseDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [studentName, setStudentName] = useState<string>('Unknown');
  const [studentEmail, setStudentEmail] = useState<string>('Unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    purchaseService.getById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'Purchase not found'); setLoading(false); return; }
      setPurchase(data);
      const { data: batchData } = await batchService.getById(data.batchId);
      if (batchData) setBatch(batchData);
      const supabase = getSupabaseClient();
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.profileId).maybeSingle();
      if (profile) {
        const row = profile as { full_name: string | null; email: string | null };
        setStudentName(row.full_name ?? 'Unknown');
        setStudentEmail(row.email ?? 'Unknown');
      }
      setLoading(false);
    });
  }, [id]);

  const handleRefund = async () => {
    if (!id) return;
    setActionLoading(true);
    await purchaseService.updatePaymentStatus(id, 'refunded');
    setActionLoading(false);
    setConfirmRefund(false);
    navigate('/admin/purchases');
  };

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !purchase) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Purchase not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/purchases')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">Purchase Details</h1>
        <PurchaseStatusBadge status={purchase.paymentStatus} />
      </div>
      {purchase.paymentStatus === 'completed' && (
        <Button variant="danger" size="sm" onClick={() => setConfirmRefund(true)}><RotateCcw className="h-3.5 w-3.5" />Refund</Button>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-neutral-800">Payment Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Purchase ID:</span><span className="font-mono text-xs text-neutral-900">{purchase.id}</span></div>
            <div className="flex items-center gap-3"><User className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Student:</span><span className="text-sm font-medium text-neutral-900">{studentName}</span></div>
            <div className="flex items-center gap-3"><User className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Email:</span><span className="text-sm text-neutral-900">{studentEmail}</span></div>
            {batch && <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Batch:</span><span className="text-sm font-medium text-neutral-900">{batch.title}</span></div>}
            <div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Gateway:</span><span className="text-sm text-neutral-900">{purchase.gateway}</span></div>
            <div className="flex items-center gap-3"><DollarSign className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Amount:</span><span className="text-sm font-bold text-success-600">₹{purchase.amount.toLocaleString()} {purchase.currency}</span></div>
            <div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Method:</span><span className="text-sm text-neutral-900">{purchase.paymentMethod ?? '—'}</span></div>
            {purchase.transactionReference && <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Transaction ID:</span><span className="font-mono text-xs text-neutral-900">{purchase.transactionReference}</span></div>}
            <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Date:</span><span className="text-sm text-neutral-900">{format(new Date(purchase.purchasedAt), 'MMM d, yyyy h:mm a')}</span></div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmRefund} onClose={() => setConfirmRefund(false)} onConfirm={handleRefund} title="Refund Purchase" message="Are you sure you want to refund this purchase? This will mark the payment as refunded." confirmLabel="Refund" loading={actionLoading} variant="danger" />
    </div>
  );
}
