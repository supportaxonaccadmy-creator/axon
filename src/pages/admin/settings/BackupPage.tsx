import { useCallback } from 'react';
import { Download, RotateCcw, Trash2, Plus } from 'lucide-react';
import { useBackups } from '@/hooks/useAdminSettings';
import { SettingsLayout } from './SettingsDashboardPage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/admin/settings';
import { ConfirmDialog } from '@/components/admin/common';
import { useState } from 'react';
import { format } from 'date-fns';

export function BackupPage() {
  const { backups, loading, createBackup, deleteBackup } = useBackups();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = useCallback(() => {
    if (confirmDelete) deleteBackup(confirmDelete);
    setConfirmDelete(null);
  }, [confirmDelete, deleteBackup]);

  return (
    <SettingsLayout title="Backup & Restore" description="Manage database backups" icon={undefined}
      actions={<Button onClick={createBackup}><Plus className="h-4 w-4" />Create Backup</Button>}>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : backups.length === 0 ? (
        <EmptyState title="No backups found" description="Create your first backup to get started." icon={<Download className="h-12 w-12" />} action={<Button onClick={createBackup}><Plus className="h-4 w-4" />Create Backup</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
            <span className="flex-1 text-xs font-medium text-neutral-500">Filename</span>
            <span className="hidden w-24 text-xs font-medium text-neutral-500 sm:block">Size</span>
            <span className="hidden w-32 text-xs font-medium text-neutral-500 sm:block">Created</span>
            <span className="w-28 text-xs font-medium text-neutral-500">Status</span>
            <span className="w-28 text-xs font-medium text-neutral-500">Actions</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {backups.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-900">{b.filename}</p></div>
                <div className="hidden w-24 text-xs text-neutral-600 sm:block">{b.size}</div>
                <div className="hidden w-32 text-xs text-neutral-600 sm:block">{format(new Date(b.createdAt), 'MMM d, yyyy h:mm a')}</div>
                <div className="w-28"><StatusBadge status={b.status} /></div>
                <div className="flex w-28 items-center gap-1">
                  <Button size="sm" variant="ghost" aria-label="Download"><Download className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" aria-label="Restore"><RotateCcw className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(b.id)} aria-label="Delete"><Trash2 className="h-3.5 w-3.5 text-error-600" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Delete Backup" message="Are you sure you want to delete this backup?" confirmLabel="Delete" loading={false} />
    </SettingsLayout>
  );
}
