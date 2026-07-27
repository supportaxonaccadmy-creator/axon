import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BookOpen, Copy, Eye, Edit, Trash2, Archive, RotateCcw, CheckCircle2, EyeOff } from 'lucide-react';
import { useAdminSubjects, type SubjectWithBatch } from '@/hooks/useAdminLms';
import { subjectService } from '@/services/lms/subjectService';
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

export function SubjectListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [batchId, setBatchId] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; ids: string[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const { subjects, batches, loading, error, total, totalPages, page, setPage, refresh } = useAdminSubjects({
    search: debouncedSearch || undefined,
    batchId: batchId || undefined,
    status,
  });

  const batchOptions: Option[] = [{ label: 'All Batches', value: '' }, ...batches.map((b) => ({ label: b.title, value: b.id }))];

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => prev.size === subjects.length ? new Set() : new Set(subjects.map((s) => s.id)));
  }, [subjects]);

  const handleMove = useCallback(async (subject: SubjectWithBatch, direction: 'up' | 'down') => {
    const idx = subjects.findIndex((s) => s.id === subject.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= subjects.length) return;
    const swapSubject = subjects[swapIdx]!;
    await Promise.all([
      subjectService.update(subject.id, { sortOrder: swapSubject.sortOrder }),
      subjectService.update(swapSubject.id, { sortOrder: subject.sortOrder }),
    ]);
    refresh();
  }, [subjects, refresh]);

  const handleDuplicate = useCallback(async (subject: SubjectWithBatch) => {
    setActionLoading(true);
    await subjectService.create({
      batchId: subject.batchId, title: `${subject.title} (Copy)`, slug: `${subject.slug}-copy-${Date.now().toString(36)}`,
      description: subject.description, icon: subject.icon, status: 'draft', sortOrder: subject.sortOrder + 1,
    });
    setActionLoading(false); refresh();
  }, [refresh]);

  const handleStatusChange = useCallback(async (id: string, newStatus: LmsStatus) => {
    await subjectService.update(id, { status: newStatus }); refresh();
  }, [refresh]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    await subjectService.remove(confirmDelete);
    setActionLoading(false); setConfirmDelete(null); refresh();
  }, [confirmDelete, refresh]);

  const handleBulkAction = useCallback(async () => {
    if (!confirmBulk) return;
    setActionLoading(true);
    const { action, ids } = confirmBulk;
    await Promise.all(ids.map(async (id) => {
      if (action === 'publish') await subjectService.update(id, { status: 'published' });
      else if (action === 'unpublish') await subjectService.update(id, { status: 'draft' });
      else if (action === 'archive') await subjectService.update(id, { status: 'archived' });
      else if (action === 'restore') await subjectService.update(id, { status: 'draft' });
      else if (action === 'delete') await subjectService.remove(id);
    }));
    setActionLoading(false); setConfirmBulk(null); setSelected(new Set()); refresh();
  }, [confirmBulk, refresh]);

  const selectedIds = Array.from(selected);

  return (
    <div className="space-y-6">
      <PageHeader title="Subjects" description={`${total} subject${total !== 1 ? 's' : ''} across all batches`} actions={<Button onClick={() => navigate('/admin/subjects/new')}><Plus className="h-4 w-4" />New Subject</Button>} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input placeholder="Search subjects by title..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10" />
        </div>
        <Select options={batchOptions} value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="All Batches" className="sm:w-56" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44" />
      </div>
      <BulkActionBar selectedCount={selected.size} onPublish={() => setConfirmBulk({ action: 'publish', ids: selectedIds })} onUnpublish={() => setConfirmBulk({ action: 'unpublish', ids: selectedIds })} onArchive={() => setConfirmBulk({ action: 'archive', ids: selectedIds })} onRestore={() => setConfirmBulk({ action: 'restore', ids: selectedIds })} onDelete={() => setConfirmBulk({ action: 'delete', ids: selectedIds })} onClear={() => setSelected(new Set())} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : subjects.length === 0 ? (
        <EmptyState title="No subjects found" description="Create your first subject to get started." icon={<BookOpen className="h-12 w-12" />} action={<Button onClick={() => navigate('/admin/subjects/new')}><Plus className="h-4 w-4" />New Subject</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
            <input type="checkbox" checked={selected.size === subjects.length && subjects.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            <span className="w-10 text-xs font-medium text-neutral-500">Order</span>
            <span className="flex-1 text-xs font-medium text-neutral-500">Title</span>
            <span className="w-32 text-xs font-medium text-neutral-500">Batch</span>
            <span className="w-20 text-xs font-medium text-neutral-500">Chapters</span>
            <span className="w-24 text-xs font-medium text-neutral-500">Status</span>
            <span className="w-28 text-xs font-medium text-neutral-500">Actions</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {subjects.map((subject, idx) => (
              <div key={subject.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50', selected.has(subject.id) && 'bg-primary-50/50')}>
                <input type="checkbox" checked={selected.has(subject.id)} onChange={() => toggleSelect(subject.id)} className="h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <SortableRow canMoveUp={idx > 0} canMoveDown={idx < subjects.length - 1} onMoveUp={() => handleMove(subject, 'up')} onMoveDown={() => handleMove(subject, 'down')} className="flex-1">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-neutral-900">{subject.title}</p><p className="truncate text-xs text-neutral-500">/{subject.slug}</p></div>
                </SortableRow>
                <div className="hidden w-32 shrink-0 sm:block"><Badge variant="default" className="truncate">{subject.batchTitle}</Badge></div>
                <div className="hidden w-20 shrink-0 text-sm text-neutral-600 sm:block">{subject.chapterCount}</div>
                <div className="w-24 shrink-0"><StatusBadge status={subject.status} /></div>
                <div className="flex w-28 shrink-0 items-center gap-1">
                  <button onClick={() => navigate(`/admin/subjects/${subject.id}`)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="View"><Eye className="h-3.5 w-3.5" /></button>
                  <button onClick={() => navigate(`/admin/subjects/${subject.id}/edit`)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDuplicate(subject)} disabled={actionLoading} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                  {subject.status === 'published' ? (
                    <button onClick={() => handleStatusChange(subject.id, 'draft')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-warning-600" title="Unpublish"><EyeOff className="h-3.5 w-3.5" /></button>
                  ) : subject.status === 'archived' ? (
                    <button onClick={() => handleStatusChange(subject.id, 'draft')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-success-600" title="Restore"><RotateCcw className="h-3.5 w-3.5" /></button>
                  ) : (
                    <button onClick={() => handleStatusChange(subject.id, 'published')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-success-600" title="Publish"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                  )}
                  {subject.status === 'archived' ? (
                    <button onClick={() => handleStatusChange(subject.id, 'archived')} disabled className="rounded p-1.5 text-neutral-400 opacity-30" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                  ) : (
                    <button onClick={() => handleStatusChange(subject.id, 'archived')} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-warning-600" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                  )}
                  <button onClick={() => setConfirmDelete(subject.id)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-error-600" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Subject" message="Are you sure you want to delete this subject? This action cannot be undone." confirmLabel="Delete" loading={actionLoading} />
      <ConfirmDialog open={!!confirmBulk} onClose={() => setConfirmBulk(null)} onConfirm={handleBulkAction} title="Confirm Bulk Action" message={`Are you sure you want to ${confirmBulk?.action ?? ''} ${confirmBulk?.ids.length ?? 0} subject(s)?`} confirmLabel={confirmBulk?.action === 'delete' ? 'Delete All' : 'Apply'} loading={actionLoading} variant={confirmBulk?.action === 'delete' ? 'danger' : 'primary'} />
    </div>
  );
}
