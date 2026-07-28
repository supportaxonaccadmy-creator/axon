import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/services/storage';
import type { FileListOptions, FileRecord, FileCategory, StorageBucket } from '@/services/storage';

export function useFileManager(initialOptions: FileListOptions = {}) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialOptions.page ?? 1);
  const [pageSize] = useState(initialOptions.pageSize ?? 20);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState(initialOptions.search ?? '');
  const [filterType, setFilterType] = useState<FileCategory | undefined>(initialOptions.fileType);
  const [filterBucket, setFilterBucket] = useState<StorageBucket | undefined>(initialOptions.bucket);
  const [sortBy, setSortBy] = useState<'created_at' | 'file_size' | 'original_name'>(initialOptions.sortBy ?? 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialOptions.sortOrder ?? 'desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await storageService.getFiles({
      fileType: filterType,
      bucket: filterBucket,
      entityType: initialOptions.entityType,
      entityId: initialOptions.entityId,
      search: search || undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });
    setFiles(result.files);
    setTotal(result.total);
    setHasMore(result.hasMore);
    setLoading(false);
  }, [filterType, filterBucket, initialOptions.entityType, initialOptions.entityId, search, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    void fetchFiles();
  }, [fetchFiles]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(files.map((f) => f.id)));
  }, [files]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    const { error: err } = await storageService.deleteFile(fileId);
    if (err) { setError(err); return false; }
    await fetchFiles();
    return true;
  }, [fetchFiles]);

  const bulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return false;
    const { error: err } = await storageService.bulkDeleteFiles(ids);
    if (err) { setError(err); return false; }
    setSelectedIds(new Set());
    await fetchFiles();
    return true;
  }, [selectedIds, fetchFiles]);

  const replaceFile = useCallback(async (fileId: string, newFile: File) => {
    const { fileRecord, error: err } = await storageService.replaceFile({ fileId, newFile });
    if (err) { setError(err); return null; }
    await fetchFiles();
    return fileRecord;
  }, [fetchFiles]);

  const getSignedUrl = useCallback(async (file: FileRecord) => {
    return storageService.getSignedUrl(file.storageBucket, file.filePath);
  }, []);

  const copyUrl = useCallback(async (file: FileRecord) => {
    const { url } = await storageService.getSignedUrl(file.storageBucket, file.filePath);
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  return {
    files, total, loading, error, page, pageSize, hasMore,
    search, filterType, filterBucket, sortBy, sortOrder, selectedIds,
    setSearch, setFilterType, setFilterBucket, setSortBy, setSortOrder,
    setPage, fetchFiles,
    toggleSelection, selectAll, clearSelection,
    deleteFile, bulkDelete, replaceFile, getSignedUrl, copyUrl,
  };
}
