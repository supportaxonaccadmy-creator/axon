import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Copy, Eye, Edit, Trash2, Archive, RotateCcw, CheckCircle2, EyeOff } from 'lucide-react';
import { useAdminChapters, type ChapterWithSubject } from '@/hooks/useAdminLms';
import { chapterService } from '@/services/lms/chapterService';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge, BulkActionBar, ConfirmDialog, SortableRow } from '@/components/admin/common';
import { cn } from '@/utils/cn';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

const STATUS_OPTIONS: Option[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

export function ChapterListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [batchId, setBatchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; ids: string[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const { chapters, subjects, batches, loading, error, total, totalPages, page, setPage, refresh } = useAdminChapters({
    search: debouncedSearch || undefined, subjectId: subjectId || undefined, batchId: batchId || undefined, status,
  });

  const batchOptions: Option[] = [{ label: 'All Batches', value: '' }, ...batches.map((b) => ({ label: b.title, value: b.id }))];
  const subjectOptions: Option[] = [{ label: 'All Subjects', value: '' }, ...subjects.map((s) => ({ label: s.title, value: s.id }))];

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => prev.size === chapters.length ? new Set() : new Set(chapters.map((c) => c.id)));
  }, [chapters]);

  const handleMove = useCallback(async (chapter: ChapterWithSubject, direction: 'up' | 'down') => {
    const idx = chapters.findIndex((c) => c.id === chapter.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= chapters.length) return;
    const swapChapter = chapters[swapIdx]!;
    await Promise.all([
      chapterService.update(chapter.id, { sortOrder: swapChapter.sortOrder }),
      chapterService.update(swapChapter.id, { sortOrder: chapter.sortOrder }),
    ]);
    refresh();
  }, [chapters, refresh]);

  const handleDuplicate = useCallback(async (chapter: ChapterWithSubject) => {
    setActionLoading(true);
    await chapterService.create({ subjectId: chapter.subjectId, title: `${chapter.title} (Copy)`, slug: `${chapter.slug}-copy-${Date.now().toString(36)}`, description: chapter.description, status: 'draft', sortOrder: chapter.sortOrder + 1 });
    setActionLoading(false); refresh();
  }, [refresh]);

  const handleStatusChange = useCallback(async (id: string, newStatus: LmsStatus) => {
    await chapterService.update(id, { status: newStatus }); refresh();
  }, [refresh]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    await chapterService.remove(confirmDelete);
    setActionLoading(false); setConfirmDelete(null); refresh();
  }, [confirmDelete, refresh]);

  const handleBulkAction = useCallback(async () => {
    if (!confirmBulk) return;
    setActionLoading(true);
    const { action, ids } = confirmBulk;
    await Promise.all(ids.map(async (id) => {
      if (action === 'publish') await chapterService.update(id, { status: 'published' });
      else if (action === 'unpublish') await chapterService.update(id, { status: 'draft' });
      else if (action === 'archive') await chapterService.update(id, { status: 'archived' });
      else if (action === 'restore') await chapterService.update(id, { status: 'draft' });
      else if (action === 'delete') await chapterService.remove(id);
    }));
    setActionLoading(false); setConfirmBulk(null); setSelected(new Set()); refresh();
  }, [confirmBulk, refresh]);

  const selectedIds = Array.from(selected);

  return (
    <div className="space-y-6">
      <PageHeader title="Chapters" description={`${total} chapter${total !== 1 ? 's' : ''} across all subjects`} actions={<Button onClick={() => navigate('/admin/chapters/new')}><Plus className="h-4 w-4" />New Chapter</Button>} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input placeholder="Search chapters by title..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10" />
        </div>
        <Select options={batchOptions} value={batchId} onChange={(e) => { setBatchId(e.target.value); setSubjectId(''); }} placeholder="All Batches" className="sm:w-48" />
        <Select options={subjectOptions} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} placeholder="All Subjects" className="sm:w-48" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44" />
      </div>
      <BulkActionBar selectedCount={selected.size} onPublish={() => setConfirmBulk({ action: 'publish', ids: selectedIds })} onUnpublish={() => setConfirmBulk({ action: 'unpublish', ids: selectedIds })} onArchive={() => setConfirmBulk({ action: 'archive', ids: selectedIds })} onRestore={() => setConfirmBulk({ action: 'restore', ids: selectedIds })} onDelete={() => setConfirmBulk({ action: 'delete', ids: selectedIds })} onClear={() => setSelected(new Set())} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : chapters.length === 0 ? (
        <EmptyState title="No chapters found" description="Create your first chapter to get started." icon={<FileText className="h-12 w-12" />} action={<Button onClick={() => navigate('/admin/chapters/new')}><Plus className="h-4 w-4" />New Chapter</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
            <input type="checkbox" checked={selected.size === chapters.length && chapters.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            <span className="w-10 text-xs font-medium text-neutral-500">Order</span>
            <span className="flex-1 text-xs font-medium text-neutral-500">Title</span>
            <span className="w-32 text-xs font-medium text-neutral-500">Subject</span>
            <span className="w-28 text-xs font-medium text-neutral-500">Batch</span>
            <span className="w-24 text-xs font-medium text-neutral-500">Status</span>
            <span className="w-28 text-xs font-medium text-neutral-500">Actions</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {chapters.map((chapter, idx) => (
              <div key={chapter.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50', selected.has(chapter.id) && 'bg-primary-50/50')}>
                <input type="checkbox" checked={selected.has(chapter.id)} onChange={() => toggleSelect(chapter.id)} className="h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <SortableRow canMoveUp={idx > 0} canMoveDown={idx < chapters.length - 1} onMoveUp={() => handleMove(chapter, 'up')} onMoveDown={() => handleMove(chapter, 'down')} className="flex-1">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-neutral-900">{chapter.title}</p><p className="truncate text-xs text-neutral-500">/{chapter.slug}</p></div>
                </SortableRow>
                <div className="hidden w-32 shrink-0 sm:block"><Badge variant="default" className="truncate">{chapter.subjectTitle}</Badge></div>
                <div className="hidden w-28 shrink-0 text-xs text-neutral-500 sm:block">{chapter.batchTitle}</div>
                <div className="w-24 shrink-0"><StatusBadge status={chapter.status} /></div>
                <div className="flex w-28 shrink-0 items-center gap-1">
                  <button onClick={() => navigate(`/admin/chapters/${chapter.id}`)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="View"><Eye className="h-3.5 w-3.5" /></button>
                  <button onClick={() => navigate(`/admin/chapters/${chapter.id}/edit`)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDuplicate(chapter)} disabled={actionLoading} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                  {chapter.status === 'published' ? (
                    <button onClick={() => handleStatusChange(chapter.id, 'draft')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-warning-600" title="Unpublish"><EyeOff className="h-3.5 w-3.5" /></button>
                  ) : chapter.status === 'archived' ? (
                    <button onClick={() => handleStatusChange(chapter.id, 'draft')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-success-600" title="Restore"><RotateCcw className="h-3.5 w-3.5" /></button>
                  ) : (
                    <button onClick={() => handleStatusChange(chapter.id, 'published')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-success-600" title="Publish"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                  )}
                  {chapter.status !== 'archived' && (
                    <button onClick={() => handleStatusChange(chapter.id, 'archived')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-warning-600" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                  )}
                  <button onClick={() => setConfirmDelete(chapter.id)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-error-600" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
              <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Chapter" message="Are you sure you want to delete this chapter? This action cannot be undone." confirmLabel="Delete" loading={actionLoading} />
      <ConfirmDialog open={!!confirmBulk} onClose={() => setConfirmBulk(null)} onConfirm={handleBulkAction} title="Confirm Bulk Action" message={`Are you sure you want to ${confirmBulk?.action ?? ''} ${confirmBulk?.ids.length ?? 0} chapter(s)?`} confirmLabel={confirmBulk?.action === 'delete' ? 'Delete All' : 'Apply'} loading={actionLoading} variant={confirmBulk?.action === 'delete' ? 'danger' : 'primary'} />
    </div>
  );
}
