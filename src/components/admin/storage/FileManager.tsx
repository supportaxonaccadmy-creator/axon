import { useState, useMemo, useCallback } from 'react';
import {
  Search, Grid, List, Download, Copy, Trash2, Replace, File as FileIcon,
  Image as ImageIcon, FileText, Film, FileCheck, CheckSquare, Square,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useFileManager } from '@/hooks/useFileManager';
import { formatFileSize, type FileRecord, type FileCategory, type EntityType } from '@/services/storage';

interface FileManagerProps {
  entityType?: string | undefined;
  entityId?: string | undefined;
  onFileSelect?: ((file: FileRecord) => void) | undefined;
}

export function FileManager({ entityType, entityId, onFileSelect }: FileManagerProps) {
  const {
    files, total, loading, error, page, hasMore,
    filterType, sortBy, sortOrder, selectedIds,
    setSearch, setFilterType, setSortBy, setSortOrder,
    setPage, toggleSelection, selectAll, clearSelection,
    deleteFile, bulkDelete, replaceFile, getSignedUrl, copyUrl,
  } = useFileManager({ entityType: entityType as EntityType | undefined, entityId: entityId ?? undefined });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<string | null>(null);

  const handleDelete = useCallback(async (fileId: string) => {
    const ok = await deleteFile(fileId);
    if (ok) setConfirmDelete(null);
  }, [deleteFile]);

  const handleBulkDelete = useCallback(async () => {
    await bulkDelete();
    setConfirmDelete(null);
  }, [bulkDelete]);

  const handleReplace = useCallback(async (fileId: string, file: File) => {
    await replaceFile(fileId, file);
    setReplaceTarget(null);
  }, [replaceFile]);

  const handleDownload = useCallback(async (file: FileRecord) => {
    const { url } = await getSignedUrl(file);
    if (url) {
      window.open(url, '_blank');
    }
  }, [getSignedUrl]);

  const handleCopy = useCallback(async (file: FileRecord) => {
    await copyUrl(file);
  }, [copyUrl]);

  const debouncedSearch = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setSearch(value), 300);
    };
  }, [setSearch]);

  const typeFilters: { label: string; value: FileCategory | undefined }[] = [
    { label: 'All', value: undefined },
    { label: 'Images', value: 'image' },
    { label: 'PDFs', value: 'pdf' },
    { label: 'Videos', value: 'video' },
    { label: 'Documents', value: 'document' },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search files..."
              className="pl-9"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType ?? ''}
            onChange={(e) => setFilterType((e.target.value || undefined) as FileCategory | undefined)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {typeFilters.map((f) => (
              <option key={f.label} value={f.value ?? ''}>{f.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'created_at' | 'file_size' | 'original_name')}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="created_at">Date</option>
            <option value="file_size">Size</option>
            <option value="original_name">Name</option>
          </select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>

          <div className="flex items-center rounded-lg border border-neutral-300">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
          <span className="text-sm font-medium text-primary-700">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete('bulk')}>
              <Trash2 className="h-4 w-4" /> Delete selected
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
        </div>
      )}

      {/* Files */}
      {!loading && files.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <FileIcon className="h-12 w-12 text-neutral-300" />
          <p className="mt-3 text-sm text-neutral-500">No files found</p>
        </Card>
      )}

      {!loading && files.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <FileGridCard
              key={file.id}
              file={file}
              selected={selectedIds.has(file.id)}
              onToggle={() => toggleSelection(file.id)}
              onDownload={() => void handleDownload(file)}
              onCopy={() => void handleCopy(file)}
              onDelete={() => setConfirmDelete(file.id)}
              onReplace={() => setReplaceTarget(file.id)}
              onClick={() => onFileSelect?.(file)}
            />
          ))}
        </div>
      )}

      {!loading && files.length > 0 && viewMode === 'list' && (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={selectedIds.size === files.length ? clearSelection : selectAll}>
                    {selectedIds.size === files.length && files.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-primary-500" />
                    ) : (
                      <Square className="h-4 w-4 text-neutral-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {files.map((file) => (
                <FileListRow
                  key={file.id}
                  file={file}
                  selected={selectedIds.has(file.id)}
                  onToggle={() => toggleSelection(file.id)}
                  onDownload={() => void handleDownload(file)}
                  onCopy={() => void handleCopy(file)}
                  onDelete={() => setConfirmDelete(file.id)}
                  onReplace={() => setReplaceTarget(file.id)}
                  onClick={() => onFileSelect?.(file)}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900">Delete file?</h3>
            <p className="mt-2 text-sm text-neutral-600">
              This action cannot be undone. The file will be permanently removed from storage.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => void confirmDelete === 'bulk' ? handleBulkDelete() : handleDelete(confirmDelete)}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Replace dialog */}
      {replaceTarget && (
        <ReplaceDialog
          onConfirm={(file) => void handleReplace(replaceTarget, file)}
          onCancel={() => setReplaceTarget(null)}
        />
      )}
    </div>
  );
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'image': return <ImageIcon className="h-5 w-5 text-blue-500" />;
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'video': return <Film className="h-5 w-5 text-purple-500" />;
    case 'document': return <FileCheck className="h-5 w-5 text-green-500" />;
    default: return <FileIcon className="h-5 w-5 text-neutral-400" />;
  }
}

function FileGridCard({
  file, selected, onToggle, onDownload, onCopy, onDelete, onReplace, onClick,
}: {
  file: FileRecord;
  selected: boolean;
  onToggle: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onReplace: () => void;
  onClick: () => void;
}) {
  return (
    <Card hover className={cn('relative', selected && 'ring-2 ring-primary-500')}>
      <div className="absolute left-2 top-2 z-10">
        <button onClick={onToggle}>
          {selected ? (
            <CheckSquare className="h-5 w-5 text-primary-500" />
          ) : (
            <Square className="h-5 w-5 text-neutral-300" />
          )}
        </button>
      </div>

      <div className="flex h-32 items-center justify-center rounded-t-xl bg-neutral-50" onClick={onClick}>
        {file.fileType === 'image' ? (
          <img src={`/storage/${file.storageBucket}/${file.filePath}`} alt={file.originalName} className="h-full w-full rounded-t-xl object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {getFileIcon(file.fileType)}
            <span className="text-xs text-neutral-500 uppercase">{file.fileType}</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-neutral-900" title={file.originalName}>{file.originalName}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{formatFileSize(file.fileSize)}</p>

        <div className="mt-2 flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onDownload} title="Download">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onCopy} title="Copy URL">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onReplace} title="Replace">
            <Replace className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
            <Trash2 className="h-4 w-4 text-error-500" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FileListRow({
  file, selected, onToggle, onDownload, onCopy, onDelete, onReplace, onClick,
}: {
  file: FileRecord;
  selected: boolean;
  onToggle: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onReplace: () => void;
  onClick: () => void;
}) {
  return (
    <tr className={cn('hover:bg-neutral-50', selected && 'bg-primary-50/50')}>
      <td className="px-4 py-3">
        <button onClick={onToggle}>
          {selected ? (
            <CheckSquare className="h-4 w-4 text-primary-500" />
          ) : (
            <Square className="h-4 w-4 text-neutral-300" />
          )}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {getFileIcon(file.fileType)}
          <button onClick={onClick} className="truncate text-sm font-medium text-neutral-900 hover:text-primary-600" title={file.originalName}>
            {file.originalName}
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600 uppercase">{file.fileType}</td>
      <td className="px-4 py-3 text-sm text-neutral-600">{formatFileSize(file.fileSize)}</td>
      <td className="px-4 py-3 text-sm text-neutral-600">{new Date(file.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={onDownload}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onCopy}><Copy className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onReplace}><Replace className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4 text-error-500" /></Button>
        </div>
      </td>
    </tr>
  );
}

function ReplaceDialog({ onConfirm, onCancel }: { onConfirm: (file: File) => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="max-w-md p-6">
        <h3 className="text-lg font-semibold text-neutral-900">Replace file</h3>
        <p className="mt-2 text-sm text-neutral-600">Select a new file to replace the existing one.</p>
        <input
          type="file"
          className="mt-4 w-full"
          onChange={(e) => {
            if (e.target.files?.[0]) onConfirm(e.target.files[0]);
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
