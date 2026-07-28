import { useState, useCallback, useRef } from 'react';
import { storageService } from '@/services/storage';
import { validateFile, compressImage } from '@/services/storage';
import type { StorageBucket, EntityType, FileRecord } from '@/services/storage';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'paused' | 'cancelled';
  error: string | null;
  result: FileRecord | null;
}

interface UseFileUploadOptions {
  bucket: StorageBucket;
  entityType?: EntityType | undefined;
  entityId?: string | undefined;
  isPublic?: boolean | undefined;
  autoCompress?: boolean | undefined;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      progress: 0,
      status: 'pending' as const,
      error: null,
      result: null,
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const uploadOne = useCallback(async (item: UploadItem) => {
    const controller = new AbortController();
    abortControllers.current.set(item.id, controller);

    setItems((prev) => prev.map((p) =>
      p.id === item.id ? { ...p, status: 'uploading' as const, progress: 0 } : p
    ));

    let fileToUpload = item.file;
    if (options.autoCompress !== false && item.file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImage(item.file);
      } catch { /* use original */ }
    }

    const { fileRecord, error } = await storageService.uploadFile({
      bucket: options.bucket,
      file: fileToUpload,
      entityType: options.entityType ?? undefined,
      entityId: options.entityId ?? undefined,
      isPublic: options.isPublic ?? false,
      onProgress: (pct) => {
        setItems((prev) => prev.map((p) =>
          p.id === item.id ? { ...p, progress: pct } : p
        ));
      },
      signal: controller.signal,
    });

    if (error) {
      setItems((prev) => prev.map((p) =>
        p.id === item.id ? { ...p, status: 'error' as const, error } : p
      ));
    } else {
      setItems((prev) => prev.map((p) =>
        p.id === item.id ? { ...p, status: 'completed' as const, progress: 100, result: fileRecord } : p
      ));
    }

    abortControllers.current.delete(item.id);
  }, [options.bucket, options.entityType, options.entityId, options.isPublic, options.autoCompress]);

  const uploadAll = useCallback(async () => {
    const pending = items.filter((i) => i.status === 'pending' || i.status === 'error');
    for (const item of pending) {
      await uploadOne(item);
    }
  }, [items, uploadOne]);

  const cancelUpload = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(id);
    }
    setItems((prev) => prev.map((p) =>
      p.id === id ? { ...p, status: 'cancelled' as const } : p
    ));
  }, []);

  const retryUpload = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((p) =>
      p.id === id ? { ...p, status: 'pending' as const, error: null } : p
    ));
    await uploadOne({ ...item, status: 'pending', error: null });
  }, [items, uploadOne]);

  const removeItem = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(id);
    }
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((p) => p.status !== 'completed'));
  }, []);

  const clearAll = useCallback(() => {
    abortControllers.current.forEach((c) => c.abort());
    abortControllers.current.clear();
    setItems([]);
  }, []);

  const validateFiles = useCallback((files: File[]): { valid: File[]; invalid: { file: File; errors: string[] }[] } => {
    const valid: File[] = [];
    const invalid: { file: File; errors: string[] }[] = [];
    for (const file of files) {
      const result = validateFile(file);
      if (result.valid) {
        valid.push(file);
      } else {
        invalid.push({ file, errors: result.errors });
      }
    }
    return { valid, invalid };
  }, []);

  return {
    items,
    addFiles,
    uploadAll,
    uploadOne,
    cancelUpload,
    retryUpload,
    removeItem,
    clearCompleted,
    clearAll,
    validateFiles,
  };
}
