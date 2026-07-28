import { memo } from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getPaymentMethodLabel } from '@/services/payment/paymentHelpers';
import { INSTITUTE_INFO, PAYMENT_STATUS_LABELS } from '@/constants/payment';
import { generateInvoiceNumber } from '@/services/payment/paymentHelpers';
import { format } from 'date-fns';
import type { InvoiceData } from '@/types/payment';

interface InvoiceCardProps {
  invoice: InvoiceData;
}

function InvoiceCardComponent({ invoice }: InvoiceCardProps) {
  const handlePrint = () => { window.print(); };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm print:border-0 print:shadow-none">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4 print:hidden">
        <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary-600" /><h2 className="text-sm font-semibold text-neutral-900">Invoice</h2></div>
        <Button variant="outline" size="sm" onClick={handlePrint}><Download className="h-3.5 w-3.5" />Download PDF</Button>
      </div>
      <div className="p-6 print:p-0">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{invoice.instituteName}</h3>
            <p className="text-xs text-neutral-500">{INSTITUTE_INFO.address}</p>
            <p className="text-xs text-neutral-500">{INSTITUTE_INFO.email} | {INSTITUTE_INFO.phone}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-semibold text-neutral-900">Invoice {generateInvoiceNumber(invoice.invoiceNumber || (invoice.transactionId ?? ''))}</p>
            <p className="text-xs text-neutral-500">Date: {format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}</p>
            <p className="text-xs text-neutral-500">Status: <span className="font-medium">{PAYMENT_STATUS_LABELS[invoice.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] ?? invoice.paymentStatus}</span></p>
          </div>
        </div>
        <div className="my-6 border-t border-neutral-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><p className="text-xs font-medium text-neutral-500">Billed To</p><p className="text-sm font-semibold text-neutral-900">{invoice.studentName}</p><p className="text-xs text-neutral-500">{invoice.studentEmail}</p></div>
          <div><p className="text-xs font-medium text-neutral-500">Payment Details</p><p className="text-xs text-neutral-500">Gateway: <span className="capitalize">{invoice.gateway}</span></p><p className="text-xs text-neutral-500">Method: {getPaymentMethodLabel(null)}</p><p className="text-xs text-neutral-500">Transaction ID: {invoice.transactionId ?? '—'}</p></div>
        </div>
        <div className="my-6 border-t border-neutral-200" />
        <table className="w-full text-sm">
          <thead><tr className="border-b border-neutral-200 text-left text-xs text-neutral-500"><th className="pb-2">Description</th><th className="pb-2 text-right">Amount</th></tr></thead>
          <tbody>
            <tr><td className="py-3 text-neutral-900">{invoice.batchTitle}</td><td className="py-3 text-right font-medium text-neutral-900">{formatCurrency(invoice.amount, invoice.currency)}</td></tr>
          </tbody>
          <tfoot><tr className="border-t border-neutral-200"><td className="pt-3 text-base font-bold text-neutral-900">Total</td><td className="pt-3 text-right text-lg font-bold text-primary-600">{formatCurrency(invoice.amount, invoice.currency)}</td></tr></tfoot>
        </table>
        <p className="mt-6 text-center text-xs text-neutral-400">This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
}

export const InvoiceCard = memo(InvoiceCardComponent);
