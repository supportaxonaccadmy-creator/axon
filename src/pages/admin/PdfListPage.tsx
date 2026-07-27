import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useAdminPdfNotes, type PdfWithClass } from '@/hooks/useAdminContent';
import { pdfService } from '@/services/lms/pdfService';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContentStatusBadge, ContentActionMenu, ContentFilters, PdfPreview, formatFileSize } from '@/components/admin/content';
import { BulkActionBar, ConfirmDialog, SortableRow } from '@/components/admin/common';
import { cn } from '@/utils/cn';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

export function PdfListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [classId, setClassId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; ids: string[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const { items: pdfs, classes, loading, error, total, totalPages, page, setPage, refresh } = useAdminPdfNotes({ search: debouncedSearch || undefined, status, classId: classId || undefined });

  const classOptions: Option[] = [{ label: 'All Classes', value: '' }, ...classes.map((c) => ({ label: c.title, value: c.id }))];
  const selectedIds = Array.from(selected);

  const toggleSelect = useCallback((id: string) => { setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }, []);
  const toggleSelectAll = useCallback(() => { setSelected((prev) => prev.size === pdfs.length ? new Set() : new Set(pdfs.map((p) => p.id))); }, [pdfs]);

  const handleMove = useCallback(async (pdf: PdfWithClass, dir: 'up' | 'down') => {
    const idx = pdfs.findIndex((p) => p.id === pdf.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= pdfs.length) return;
    const swap = pdfs[swapIdx]!;
    await Promise.all([pdfService.update(pdf.id, { sortOrder: swap.sortOrder }), pdfService.update(swap.id, { sortOrder: pdf.sortOrder })]);
    refresh();
  }, [pdfs, refresh]);

  const handleDuplicate = useCallback(async (id: string) => {
    setActionLoading(true);
    const { data } = await pdfService.getById(id);
    if (data) await pdfService.create({ classId: data.classId, title: `${data.title} (Copy)`, slug: `${data.slug}-copy-${Date.now().toString(36)}`, description: data.description, fileUrl: data.fileUrl, totalPages: data.totalPages, fileSize: data.fileSize, isDownloadable: data.isDownloadable, sortOrder: data.sortOrder + 1, status: 'draft' });
    setActionLoading(false); refresh();
  }, [refresh]);

  const handleStatusChange = useCallback(async (id: string, newStatus: LmsStatus) => { await pdfService.update(id, { status: newStatus }); refresh(); }, [refresh]);
  const handleDelete = useCallback(async () => { if (!confirmDelete) return; setActionLoading(true); await pdfService.remove(confirmDelete); setActionLoading(false); setConfirmDelete(null); refresh(); }, [confirmDelete, refresh]);

  const handleBulkAction = useCallback(async () => {
    if (!confirmBulk) return;
    setActionLoading(true);
    const { action, ids } = confirmBulk;
    await Promise.all(ids.map(async (id) => {
      if (action === 'publish') await pdfService.update(id, { status: 'published' });
      else if (action === 'unpublish') await pdfService.update(id, { status: 'draft' });
      else if (action === 'archive') await pdfService.update(id, { status: 'archived' });
      else if (action === 'restore') await pdfService.update(id, { status: 'draft' });
      else if (action === 'delete') await pdfService.remove(id);
    }));
    setActionLoading(false); setConfirmBulk(null); setSelected(new Set()); refresh();
  }, [confirmBulk, refresh]);

  return (
    <div className="space-y-6">
      <PageHeader title="PDF Notes" description={`${total} PDF${total !== 1 ? 's' : ''}`} actions={<Button onClick={() => navigate('/admin/pdfs/new')}><Plus className="h-4 w-4" />New PDF</Button>} />
      <ContentFilters search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={setStatus} classOptions={classOptions} classValue={classId} onClassChange={setClassId} />
      <BulkActionBar selectedCount={selected.size} onPublish={() => setConfirmBulk({ action: 'publish', ids: selectedIds })} onUnpublish={() => setConfirmBulk({ action: 'unpublish', ids: selectedIds })} onArchive={() => setConfirmBulk({ action: 'archive', ids: selectedIds })} onRestore={() => setConfirmBulk({ action: 'restore', ids: selectedIds })} onDelete={() => setConfirmBulk({ action: 'delete', ids: selectedIds })} onClear={() => setSelected(new Set())} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : pdfs.length === 0 ? (
        <EmptyState title="No PDFs found" description="Create your first PDF note to get started." icon={<FileText className="h-12 w-12" />} action={<Button onClick={() => navigate('/admin/pdfs/new')}><Plus className="h-4 w-4" />New PDF</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
            <input type="checkbox" checked={selected.size === pdfs.length && pdfs.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            <span className="w-10 text-xs font-medium text-neutral-500">Order</span>
            <span className="flex-1 text-xs font-medium text-neutral-500">Title</span>
            <span className="hidden w-28 text-xs font-medium text-neutral-500 sm:block">Class</span>
            <span className="hidden w-20 text-xs font-medium text-neutral-500 lg:block">Size</span>
            <span className="hidden w-16 text-xs font-medium text-neutral-500 lg:block">Pages</span>
            <span className="w-24 text-xs font-medium text-neutral-500">Status</span>
            <span className="w-28 text-xs font-medium text-neutral-500">Actions</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {pdfs.map((pdf, idx) => (
              <div key={pdf.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50', selected.has(pdf.id) && 'bg-primary-50/50')}>
                <input type="checkbox" checked={selected.has(pdf.id)} onChange={() => toggleSelect(pdf.id)} className="h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <SortableRow canMoveUp={idx > 0} canMoveDown={idx < pdfs.length - 1} onMoveUp={() => handleMove(pdf, 'up')} onMoveDown={() => handleMove(pdf, 'down')} className="flex-1">
                  <PdfPreview fileUrl={pdf.fileUrl} title={pdf.title} fileSize={pdf.fileSize} pages={pdf.totalPages} isDownloadable={pdf.isDownloadable} compact />
                </SortableRow>
                <div className="hidden w-28 shrink-0 sm:block"><span className="truncate text-xs text-neutral-600">{pdf.classTitle}</span></div>
                <div className="hidden w-20 shrink-0 text-sm text-neutral-600 lg:block">{formatFileSize(pdf.fileSize)}</div>
                <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{pdf.totalPages ?? '—'}</div>
                <div className="w-24 shrink-0"><ContentStatusBadge status={pdf.status} /></div>
                <div className="flex w-28 shrink-0 justify-end"><ContentActionMenu id={pdf.id} basePath="/admin/pdfs" status={pdf.status} onDuplicate={handleDuplicate} onStatusChange={handleStatusChange} onDelete={setConfirmDelete} /></div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
              <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete PDF" message="Are you sure you want to delete this PDF?" confirmLabel="Delete" loading={actionLoading} />
      <ConfirmDialog open={!!confirmBulk} onClose={() => setConfirmBulk(null)} onConfirm={handleBulkAction} title="Confirm Bulk Action" message={`Are you sure you want to ${confirmBulk?.action ?? ''} ${confirmBulk?.ids.length ?? 0} PDF(s)?`} confirmLabel={confirmBulk?.action === 'delete' ? 'Delete All' : 'Apply'} loading={actionLoading} variant={confirmBulk?.action === 'delete' ? 'danger' : 'primary'} />
    </div>
  );
}
