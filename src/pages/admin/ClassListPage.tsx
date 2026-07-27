import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layers, Clock } from 'lucide-react';
import { useAdminClasses, type ClassWithRelations } from '@/hooks/useAdminContent';
import { classService } from '@/services/lms/classService';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContentStatusBadge, ContentActionMenu, ContentFilters } from '@/components/admin/content';
import { BulkActionBar, ConfirmDialog, SortableRow } from '@/components/admin/common';
import { cn } from '@/utils/cn';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

export function ClassListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [chapterId, setChapterId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; ids: string[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const { items: classes, chapters, loading, error, total, totalPages, page, setPage, refresh } = useAdminClasses({
    search: debouncedSearch || undefined, status, chapterId: chapterId || undefined,
  });

  const chapterOptions: Option[] = [{ label: 'All Chapters', value: '' }, ...chapters.map((c) => ({ label: c.title, value: c.id }))];
  const selectedIds = Array.from(selected);

  const toggleSelect = useCallback((id: string) => { setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }, []);
  const toggleSelectAll = useCallback(() => { setSelected((prev) => prev.size === classes.length ? new Set() : new Set(classes.map((c) => c.id))); }, [classes]);

  const handleMove = useCallback(async (cls: ClassWithRelations, dir: 'up' | 'down') => {
    const idx = classes.findIndex((c) => c.id === cls.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= classes.length) return;
    const swap = classes[swapIdx]!;
    await Promise.all([classService.update(cls.id, { sortOrder: swap.sortOrder }), classService.update(swap.id, { sortOrder: cls.sortOrder })]);
    refresh();
  }, [classes, refresh]);

  const handleDuplicate = useCallback(async (id: string) => {
    setActionLoading(true);
    const { data } = await classService.getById(id);
    if (data) await classService.create({ chapterId: data.chapterId, title: `${data.title} (Copy)`, slug: `${data.slug}-copy-${Date.now().toString(36)}`, description: data.description, thumbnail: data.thumbnail, duration: data.duration, sortOrder: data.sortOrder + 1, isPreview: data.isPreview, status: 'draft' });
    setActionLoading(false); refresh();
  }, [refresh]);

  const handleStatusChange = useCallback(async (id: string, newStatus: LmsStatus) => { await classService.update(id, { status: newStatus }); refresh(); }, [refresh]);
  const handleDelete = useCallback(async () => { if (!confirmDelete) return; setActionLoading(true); await classService.remove(confirmDelete); setActionLoading(false); setConfirmDelete(null); refresh(); }, [confirmDelete, refresh]);

  const handleBulkAction = useCallback(async () => {
    if (!confirmBulk) return;
    setActionLoading(true);
    const { action, ids } = confirmBulk;
    await Promise.all(ids.map(async (id) => {
      if (action === 'publish') await classService.update(id, { status: 'published' });
      else if (action === 'unpublish') await classService.update(id, { status: 'draft' });
      else if (action === 'archive') await classService.update(id, { status: 'archived' });
      else if (action === 'restore') await classService.update(id, { status: 'draft' });
      else if (action === 'delete') await classService.remove(id);
    }));
    setActionLoading(false); setConfirmBulk(null); setSelected(new Set()); refresh();
  }, [confirmBulk, refresh]);

  return (
    <div className="space-y-6">
      <PageHeader title="Classes" description={`${total} class${total !== 1 ? 'es' : ''}`} actions={<Button onClick={() => navigate('/admin/classes/new')}><Plus className="h-4 w-4" />New Class</Button>} />
      <ContentFilters search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={setStatus} chapterOptions={chapterOptions} chapterValue={chapterId} onChapterChange={setChapterId} />
      <BulkActionBar selectedCount={selected.size} onPublish={() => setConfirmBulk({ action: 'publish', ids: selectedIds })} onUnpublish={() => setConfirmBulk({ action: 'unpublish', ids: selectedIds })} onArchive={() => setConfirmBulk({ action: 'archive', ids: selectedIds })} onRestore={() => setConfirmBulk({ action: 'restore', ids: selectedIds })} onDelete={() => setConfirmBulk({ action: 'delete', ids: selectedIds })} onClear={() => setSelected(new Set())} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : classes.length === 0 ? (
        <EmptyState title="No classes found" description="Create your first class to get started." icon={<Layers className="h-12 w-12" />} action={<Button onClick={() => navigate('/admin/classes/new')}><Plus className="h-4 w-4" />New Class</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
            <input type="checkbox" checked={selected.size === classes.length && classes.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            <span className="w-10 text-xs font-medium text-neutral-500">Order</span>
            <span className="flex-1 text-xs font-medium text-neutral-500">Title</span>
            <span className="hidden w-28 text-xs font-medium text-neutral-500 sm:block">Chapter</span>
            <span className="hidden w-20 text-xs font-medium text-neutral-500 lg:block">Duration</span>
            <span className="hidden w-16 text-xs font-medium text-neutral-500 lg:block">Videos</span>
            <span className="hidden w-16 text-xs font-medium text-neutral-500 lg:block">PDFs</span>
            <span className="hidden w-20 text-xs font-medium text-neutral-500 lg:block">Attachments</span>
            <span className="w-24 text-xs font-medium text-neutral-500">Status</span>
            <span className="w-28 text-xs font-medium text-neutral-500">Actions</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {classes.map((cls, idx) => (
              <div key={cls.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50', selected.has(cls.id) && 'bg-primary-50/50')}>
                <input type="checkbox" checked={selected.has(cls.id)} onChange={() => toggleSelect(cls.id)} className="h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <SortableRow canMoveUp={idx > 0} canMoveDown={idx < classes.length - 1} onMoveUp={() => handleMove(cls, 'up')} onMoveDown={() => handleMove(cls, 'down')} className="flex-1">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-neutral-900">{cls.title}</p><p className="truncate text-xs text-neutral-500">/{cls.slug}</p></div>
                </SortableRow>
                <div className="hidden w-28 shrink-0 sm:block"><span className="truncate text-xs text-neutral-600">{cls.chapterTitle}</span></div>
                <div className="hidden w-20 shrink-0 text-sm text-neutral-600 lg:block"><span className="flex items-center gap-1"><Clock className="h-3 w-3 text-neutral-400" />{cls.duration ? `${Math.floor(cls.duration / 60)}:${String(cls.duration % 60).padStart(2, '0')}` : '—'}</span></div>
                <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{cls.videoCount}</div>
                <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{cls.pdfCount}</div>
                <div className="hidden w-20 shrink-0 text-sm text-neutral-600 lg:block">{cls.attachmentCount}</div>
                <div className="w-24 shrink-0"><ContentStatusBadge status={cls.status} /></div>
                <div className="flex w-28 shrink-0 justify-end"><ContentActionMenu id={cls.id} basePath="/admin/classes" status={cls.status} onDuplicate={handleDuplicate} onStatusChange={handleStatusChange} onDelete={setConfirmDelete} /></div>
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
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Class" message="Are you sure you want to delete this class?" confirmLabel="Delete" loading={actionLoading} />
      <ConfirmDialog open={!!confirmBulk} onClose={() => setConfirmBulk(null)} onConfirm={handleBulkAction} title="Confirm Bulk Action" message={`Are you sure you want to ${confirmBulk?.action ?? ''} ${confirmBulk?.ids.length ?? 0} class(es)?`} confirmLabel={confirmBulk?.action === 'delete' ? 'Delete All' : 'Apply'} loading={actionLoading} variant={confirmBulk?.action === 'delete' ? 'danger' : 'primary'} />
    </div>
  );
}
