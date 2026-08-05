import { memo, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import type { Invoice } from '@/services/finance';

interface InvoiceViewerProps { profileId?: string; }

function InvoiceViewerComponent({ profileId }: InvoiceViewerProps) {
  const { invoices, loading, refresh } = useInvoices(profileId);
  useEffect(() => { void refresh(); }, [refresh]);
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><FileText className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Invoices</h3></div><div className="space-y-2">{invoices.map((invoice: Invoice) => (<div key={invoice.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 text-xs"><div><p className="font-mono font-semibold text-neutral-900">{invoice.invoiceNumber}</p><p className="text-neutral-400">{invoice.batchTitle}</p><p className="text-neutral-400">{new Date(invoice.createdAt).toLocaleDateString()}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="font-bold text-neutral-900">₹{invoice.totalAmount.toLocaleString()}</p><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${invoice.status === 'paid' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>{invoice.status}</span></div><button className="rounded p-1 text-primary-500 hover:bg-primary-50" aria-label="Download invoice"><Download className="h-4 w-4" /></button></div></div>))}{invoices.length === 0 && !loading && <p className="text-sm text-neutral-400">No invoices yet.</p>}</div></div>);
}
export const InvoiceViewer = memo(InvoiceViewerComponent);
