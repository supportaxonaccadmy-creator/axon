import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Download } from 'lucide-react';
import { useAdminPurchases } from '@/hooks/useAdminStudents';
import { purchaseService } from '@/services/lms/purchaseService';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PurchaseTable } from '@/components/admin/students';
import { ContentFilters } from '@/components/admin/content';
import { ConfirmDialog } from '@/components/admin/common';
import type { Option } from '@/types/common';

export function PurchaseListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [batchId, setBatchId] = useState('');
  const [confirmRefund, setConfirmRefund] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { purchases, batches, loading, error, total, totalPages, page, setPage, refresh } = useAdminPurchases({ status, batchId: batchId || undefined });

  const batchOptions: Option[] = [{ label: 'All Batches', value: '' }, ...batches.map((b) => ({ label: b.title, value: b.id }))];

  const handleRefund = useCallback(async () => {
    if (!confirmRefund) return;
    setActionLoading(true);
    await purchaseService.updatePaymentStatus(confirmRefund, 'refunded');
    setActionLoading(false);
    setConfirmRefund(null);
    refresh();
  }, [confirmRefund, refresh]);

  const handleExport = useCallback(() => {
    const headers = ['ID', 'Student', 'Email', 'Batch', 'Gateway', 'Amount', 'Status', 'Date', 'Transaction ID'];
    const rows = purchases.map((p) => [p.id, p.studentName, p.studentEmail, p.batchTitle, p.gateway, String(p.amount), p.paymentStatus, p.purchasedAt, p.transactionReference ?? ''].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchases.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [purchases]);

  return (
    <div className="space-y-6">
      <PageHeader title="Purchases" description={`${total} purchase${total !== 1 ? 's' : ''}`} actions={<Button variant="outline" onClick={handleExport} disabled={purchases.length === 0}><Download className="h-4 w-4" />Export</Button>} />
      <ContentFilters search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={setStatus} classOptions={batchOptions} classValue={batchId} onClassChange={setBatchId} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : purchases.length === 0 ? (
        <EmptyState title="No purchases found" description="Purchases will appear here when students buy batches." icon={<ShoppingBag className="h-12 w-12" />} />
      ) : (
        <PurchaseTable purchases={purchases} onView={(pid) => navigate(`/admin/purchases/${pid}`)} onRefund={setConfirmRefund} />
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>
        </div>
      )}
      <ConfirmDialog open={!!confirmRefund} onClose={() => setConfirmRefund(null)} onConfirm={handleRefund} title="Refund Purchase" message="Are you sure you want to refund this purchase? This will mark the payment as refunded." confirmLabel="Refund" loading={actionLoading} variant="danger" />
    </div>
  );
}
