import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useAdminBatches, type BatchWithStats } from '@/hooks/useAdminBatches';
import { batchService } from '@/services/lms/batchService';
import { pricingService } from '@/services/lms/pricingService';
import { useDebounce } from '@/hooks/useDebounce';
import { BatchHeader, BatchFilters, BatchCard, BatchTable, BatchStatistics } from '@/components/admin/batches';
import { BulkActionBar, ConfirmDialog } from '@/components/admin/common';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import type { LmsStatus } from '@/types/lms';

export function BatchListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [pricingType, setPricingType] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; ids: string[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const { batches, loading, error, total, totalPages, page, setPage, refresh } = useAdminBatches({
    search: debouncedSearch || undefined, status, pricingType,
  });

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => prev.size === batches.length ? new Set() : new Set(batches.map((b) => b.id)));
  }, [batches]);

  const handleDuplicate = useCallback(async (batch: BatchWithStats) => {
    setActionLoading(true);
    const { data: newBatch } = await batchService.create({
      title: `${batch.title} (Copy)`, slug: `${batch.slug}-copy-${Date.now().toString(36)}`,
      description: batch.description, thumbnail: batch.thumbnail, banner: batch.banner, icon: batch.icon,
      price: batch.price, discountPrice: batch.discountPrice, isFree: batch.isFree, isPublished: false, sortOrder: batch.sortOrder + 1, status: 'draft',
    });
    if (newBatch && batch.pricing) {
      await pricingService.create({ batchId: newBatch.id, price: batch.pricing.price, salePrice: batch.pricing.salePrice, currency: batch.pricing.currency, isFree: batch.pricing.isFree, lifetimeAccess: batch.pricing.lifetimeAccess, accessDurationDays: batch.pricing.accessDurationDays, status: 'draft' });
    }
    setActionLoading(false); refresh();
  }, [refresh]);

  const handleStatusChange = useCallback(async (id: string, newStatus: LmsStatus) => {
    await batchService.update(id, { status: newStatus, isPublished: newStatus === 'published' }); refresh();
  }, [refresh]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    await batchService.remove(confirmDelete);
    setActionLoading(false); setConfirmDelete(null); refresh();
  }, [confirmDelete, refresh]);

  const handleBulkAction = useCallback(async () => {
    if (!confirmBulk) return;
    setActionLoading(true);
    const { action, ids } = confirmBulk;
    await Promise.all(ids.map(async (id) => {
      if (action === 'publish') await batchService.update(id, { status: 'published', isPublished: true });
      else if (action === 'unpublish') await batchService.update(id, { status: 'draft', isPublished: false });
      else if (action === 'archive') await batchService.update(id, { status: 'archived', isPublished: false });
      else if (action === 'restore') await batchService.update(id, { status: 'draft', isPublished: false });
      else if (action === 'delete') await batchService.remove(id);
    }));
    setActionLoading(false); setConfirmBulk(null); setSelected(new Set()); refresh();
  }, [confirmBulk, refresh]);

  const selectedIds = Array.from(selected);

  const totals = useMemo(() => ({
    totalBatches: total,
    totalEnrollments: batches.reduce((sum, b) => sum + b.enrollmentCount, 0),
    totalPurchases: batches.reduce((sum, b) => sum + b.purchaseCount, 0),
    totalRevenue: batches.reduce((sum, b) => sum + b.revenue, 0),
    totalSubjects: batches.reduce((sum, b) => sum + b.subjectCount, 0),
  }), [batches, total]);

  return (
    <div className="space-y-6">
      <BatchHeader total={total} loading={loading} onRefresh={refresh} onCreate={() => navigate('/admin/batches/new')} />
      <BatchStatistics {...totals} loading={loading} />
      <BatchFilters search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={setStatus} pricingType={pricingType} onPricingTypeChange={setPricingType} />
      <BulkActionBar selectedCount={selected.size} onPublish={() => setConfirmBulk({ action: 'publish', ids: selectedIds })} onUnpublish={() => setConfirmBulk({ action: 'unpublish', ids: selectedIds })} onArchive={() => setConfirmBulk({ action: 'archive', ids: selectedIds })} onRestore={() => setConfirmBulk({ action: 'restore', ids: selectedIds })} onDelete={() => setConfirmBulk({ action: 'delete', ids: selectedIds })} onClear={() => setSelected(new Set())} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-xl border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : batches.length === 0 ? (
        <EmptyState title="No batches found" description="Create your first batch to get started." icon={<Layers className="h-12 w-12" />} action={<Button onClick={() => navigate('/admin/batches/new')}>New Batch</Button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:hidden">
            {batches.map((batch) => <BatchCard key={batch.id} batch={batch} selected={selected.has(batch.id)} onToggleSelect={toggleSelect} onDuplicate={handleDuplicate} onStatusChange={handleStatusChange} onDelete={setConfirmDelete} />)}
          </div>
          <div className="hidden xl:block"><BatchTable batches={batches} selected={selected} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll} onDuplicate={handleDuplicate} onStatusChange={handleStatusChange} onDelete={setConfirmDelete} /></div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">Page {page} of {totalPages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button></div></div>
          )}
        </>
      )}
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Batch" message="Are you sure you want to delete this batch? This will also remove related pricing. This action cannot be undone." confirmLabel="Delete" loading={actionLoading} />
      <ConfirmDialog open={!!confirmBulk} onClose={() => setConfirmBulk(null)} onConfirm={handleBulkAction} title="Confirm Bulk Action" message={`Are you sure you want to ${confirmBulk?.action ?? ''} ${confirmBulk?.ids.length ?? 0} batch(es)?`} confirmLabel={confirmBulk?.action === 'delete' ? 'Delete All' : 'Apply'} loading={actionLoading} variant={confirmBulk?.action === 'delete' ? 'danger' : 'primary'} />
    </div>
  );
}
