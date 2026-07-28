import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { InvoiceCard } from '@/components/student/payment';
import { PaymentLoader } from '@/components/student/payment';
import { INSTITUTE_INFO } from '@/constants/payment';
import type { InvoiceData } from '@/types/payment';

export function InvoicePage() {
  const navigate = useNavigate();
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!purchaseId) { setError('No purchase specified'); setLoading(false); return; }
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error: err } = await supabase.from('purchases')
          .select('*, batches(title), profiles(full_name, email)')
          .eq('id', purchaseId).maybeSingle();
        if (err || !data) { setError(err?.message ?? 'Invoice not found'); setLoading(false); return; }
        const row = data as Record<string, unknown>;
        const batch = row.batches as Record<string, unknown> | null;
        const profile = row.profiles as Record<string, unknown> | null;
        setInvoice({
          invoiceNumber: String(row.id), invoiceDate: String(row.purchased_at ?? row.created_at),
          studentName: profile ? String(profile.full_name ?? 'Unknown') : 'Unknown',
          studentEmail: profile ? String(profile.email ?? '—') : '—',
          batchTitle: batch ? String(batch.title) : 'Unknown',
          amount: Number(row.amount), currency: String(row.currency),
          gateway: String(row.gateway), transactionId: (row.transaction_reference as string | null) ?? (row.payment_id as string | null) ?? null,
          paymentStatus: String(row.payment_status), instituteName: INSTITUTE_INFO.name,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    })();
  }, [purchaseId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate('/student/purchases')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">Invoice</h1>
      </div>
      {loading ? <PaymentLoader message="Loading invoice..." /> : error ? <Alert variant="error" title="Error">{error}</Alert> : invoice ? <InvoiceCard invoice={invoice} /> : <Alert variant="error" title="Error">Invoice not found.</Alert>}
    </div>
  );
}
