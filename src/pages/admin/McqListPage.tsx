import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileQuestion } from 'lucide-react';
import { useAdminMcqSets, type McqSetWithRelations } from '@/hooks/useAdminMcq';
import { mcqService } from '@/services/lms/mcqService';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContentStatusBadge, ContentActionMenu, ContentFilters } from '@/components/admin/content';
import { BulkActionBar, ConfirmDialog, SortableRow } from '@/components/admin/common';
import { cn } from '@/utils/cn';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

export function McqListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [classId, setClassId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; ids: string[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const { sets, classes, loading, error, total, totalPages, page, setPage, refresh } = useAdminMcqSets({ search: debouncedSearch || undefined, status, classId: classId || undefined });

  const classOptions: Option[] = [{ label: 'All Classes', value: '' }, ...classes.map((c) => ({ label: c.title, value: c.id }))];
  const selectedIds = Array.from(selected);

  const toggleSelect = useCallback((id: string) => { setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }, []);
  const toggleSelectAll = useCallback(() => { setSelected((prev) => prev.size === sets.length ? new Set() : new Set(sets.map((s) => s.id))); }, [sets]);

  const handleMove = useCallback(async (s: McqSetWithRelations, dir: 'up' | 'down') => {
    const idx = sets.findIndex((x) => x.id === s.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sets.length) return;
    const swap = sets[swapIdx]!;
    await Promise.all([mcqService.updateSetSortOrder(s.id, swap.sortOrder), mcqService.updateSetSortOrder(swap.id, s.sortOrder)]);
    refresh();
  }, [sets, refresh]);

  const handleDuplicate = useCallback(async (id: string) => {
    setActionLoading(true);
    const { data } = await mcqService.getSetById(id);
    if (data) await mcqService.createSet({ classId: data.classId, title: `${data.title} (Copy)`, slug: `${data.slug}-copy-${Date.now().toString(36)}`, description: data.description, instructions: data.instructions, durationMinutes: data.durationMinutes, totalMarks: data.totalMarks, passingMarks: data.passingMarks, attemptsAllowed: data.attemptsAllowed, shuffleQuestions: data.shuffleQuestions, showResult: data.showResult, sortOrder: data.sortOrder + 1, status: 'draft' });
    setActionLoading(false); refresh();
  }, [refresh]);

  const handleStatusChange = useCallback(async (id: string, newStatus: LmsStatus) => { await mcqService.updateSet(id, { status: newStatus }); refresh(); }, [refresh]);
  const handleDelete = useCallback(async () => { if (!confirmDelete) return; setActionLoading(true); await mcqService.removeSet(confirmDelete); setActionLoading(false); setConfirmDelete(null); refresh(); }, [confirmDelete, refresh]);

  const handleBulkAction = useCallback(async () => {
    if (!confirmBulk) return;
    setActionLoading(true);
    const { action, ids } = confirmBulk;
    await Promise.all(ids.map(async (id) => {
      if (action === 'publish') await mcqService.updateSet(id, { status: 'published' });
      else if (action === 'unpublish') await mcqService.updateSet(id, { status: 'draft' });
      else if (action === 'archive') await mcqService.updateSet(id, { status: 'archived' });
      else if (action === 'restore') await mcqService.updateSet(id, { status: 'draft' });
      else if (action === 'delete') await mcqService.removeSet(id);
    }));
    setActionLoading(false); setConfirmBulk(null); setSelected(new Set()); refresh();
  }, [confirmBulk, refresh]);

  return (
    <div className="space-y-6">
      <PageHeader title="MCQ Sets" description={`${total} set${total !== 1 ? 's' : ''}`} actions={<Button onClick={() => navigate('/admin/mcq/new')}><Plus className="h-4 w-4" />New MCQ Set</Button>} />
      <ContentFilters search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={setStatus} classOptions={classOptions} classValue={classId} onClassChange={setClassId} />
      <BulkActionBar selectedCount={selected.size} onPublish={() => setConfirmBulk({ action: 'publish', ids: selectedIds })} onUnpublish={() => setConfirmBulk({ action: 'unpublish', ids: selectedIds })} onArchive={() => setConfirmBulk({ action: 'archive', ids: selectedIds })} onRestore={() => setConfirmBulk({ action: 'restore', ids: selectedIds })} onDelete={() => setConfirmBulk({ action: 'delete', ids: selectedIds })} onClear={() => setSelected(new Set())} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : sets.length === 0 ? (
        <EmptyState title="No MCQ sets found" description="Create your first MCQ set to get started." icon={<FileQuestion className="h-12 w-12" />} action={<Button onClick={() => navigate('/admin/mcq/new')}><Plus className="h-4 w-4" />New MCQ Set</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
            <input type="checkbox" checked={selected.size === sets.length && sets.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            <span className="w-10 text-xs font-medium text-neutral-500">Order</span>
            <span className="flex-1 text-xs font-medium text-neutral-500">Title</span>
            <span className="hidden w-28 text-xs font-medium text-neutral-500 sm:block">Class</span>
            <span className="hidden w-16 text-xs font-medium text-neutral-500 lg:block">Questions</span>
            <span className="hidden w-20 text-xs font-medium text-neutral-500 lg:block">Duration</span>
            <span className="w-24 text-xs font-medium text-neutral-500">Status</span>
            <span className="w-28 text-xs font-medium text-neutral-500">Actions</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {sets.map((s, idx) => (
              <div key={s.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50', selected.has(s.id) && 'bg-primary-50/50')}>
                <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} className="h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <SortableRow canMoveUp={idx > 0} canMoveDown={idx < sets.length - 1} onMoveUp={() => handleMove(s, 'up')} onMoveDown={() => handleMove(s, 'down')} className="flex-1">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-neutral-900">{s.title}</p><p className="truncate text-xs text-neutral-500">/{s.slug}</p></div>
                </SortableRow>
                <div className="hidden w-28 shrink-0 sm:block"><span className="truncate text-xs text-neutral-600">{s.classTitle}</span></div>
                <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{s.questionCount}</div>
                <div className="hidden w-20 shrink-0 text-sm text-neutral-600 lg:block">{s.durationMinutes ? `${s.durationMinutes}m` : '—'}</div>
                <div className="w-24 shrink-0"><ContentStatusBadge status={s.status} /></div>
                <div className="flex w-28 shrink-0 justify-end"><ContentActionMenu id={s.id} basePath="/admin/mcq" status={s.status} onDuplicate={handleDuplicate} onStatusChange={handleStatusChange} onDelete={setConfirmDelete} /></div>
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
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete MCQ Set" message="Are you sure you want to delete this MCQ set and all its questions?" confirmLabel="Delete" loading={actionLoading} />
      <ConfirmDialog open={!!confirmBulk} onClose={() => setConfirmBulk(null)} onConfirm={handleBulkAction} title="Confirm Bulk Action" message={`Are you sure you want to ${confirmBulk?.action ?? ''} ${confirmBulk?.ids.length ?? 0} MCQ set(s)?`} confirmLabel={confirmBulk?.action === 'delete' ? 'Delete All' : 'Apply'} loading={actionLoading} variant={confirmBulk?.action === 'delete' ? 'danger' : 'primary'} />
    </div>
  );
}
