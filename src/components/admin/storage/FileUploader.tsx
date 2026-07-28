import { useState, useRef, useCallback, type DragEvent } from 'react';
import { UploadCloud, X, CheckCircle, AlertCircle, File as FileIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { validateFile, formatFileSize } from '@/services/storage';
import type { StorageBucket, EntityType } from '@/services/storage';
import type { UploadItem } from '@/hooks/useFileUpload';

interface FileUploaderProps {
  bucket: StorageBucket;
  entityType?: EntityType | undefined;
  entityId?: string | undefined;
  isPublic?: boolean | undefined;
  multiple?: boolean | undefined;
  autoUpload?: boolean | undefined;
  onUploadComplete?: ((fileId: string) => void) | undefined;
  className?: string | undefined;
}

export function FileUploader({
  bucket, entityType, entityId, isPublic = false,
  multiple = true, autoUpload = false, onUploadComplete, className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    items, addFiles, uploadAll, cancelUpload, retryUpload, removeItem, clearCompleted,
  } = useFileUpload({ bucket, entityType: entityType ?? undefined, entityId: entityId ?? undefined, isPublic });

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of droppedFiles) {
      const result = validateFile(file);
      if (result.valid) {
        valid.push(file);
      } else {
        errors.push(`${file.name}: ${result.errors.join(', ')}`);
      }
    }

    setValidationErrors(errors);
    if (valid.length > 0) {
      addFiles(valid);
      if (autoUpload) {
        void uploadAll();
      }
    }
  }, [addFiles, autoUpload, uploadAll]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of selectedFiles) {
      const result = validateFile(file);
      if (result.valid) {
        valid.push(file);
      } else {
        errors.push(`${file.name}: ${result.errors.join(', ')}`);
      }
    }

    setValidationErrors(errors);
    if (valid.length > 0) {
      addFiles(valid);
      if (autoUpload) {
        void uploadAll();
      }
    }
  }, [addFiles, autoUpload, uploadAll]);

  const completedItems = items.filter((i) => i.status === 'completed');

  if (completedItems.length > 0 && onUploadComplete) {
    completedItems.forEach((item) => {
      if (item.result) onUploadComplete(item.result.id);
    });
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50/50',
        )}
      >
        <UploadCloud className="h-10 w-10 text-neutral-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-700">
            Drag and drop files here, or click to browse
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Images (5MB) · PDF (50MB) · Video (2GB) · Documents (20MB)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm,.doc,.docx"
        />
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-3 rounded-lg border border-error-200 bg-error-50 p-3">
          {validationErrors.map((err, i) => (
            <p key={i} className="flex items-center gap-2 text-sm text-error-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <UploadItemRow
              key={item.id}
              item={item}
              onCancel={() => cancelUpload(item.id)}
              onRetry={() => void retryUpload(item.id)}
              onRemove={() => removeItem(item.id)}
            />
          ))}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompleted}
              disabled={!items.some((i) => i.status === 'completed')}
            >
              Clear completed
            </Button>
            {autoUpload ? null : (
              <Button
                size="sm"
                onClick={() => void uploadAll()}
                disabled={!items.some((i) => i.status === 'pending' || i.status === 'error')}
              >
                Upload all
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadItemRow({
  item, onCancel, onRetry, onRemove,
}: {
  item: UploadItem;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
      <div className="shrink-0">
        {item.status === 'completed' ? (
          <CheckCircle className="h-5 w-5 text-success-500" />
        ) : item.status === 'error' ? (
          <AlertCircle className="h-5 w-5 text-error-500" />
        ) : (
          <FileIcon className="h-5 w-5 text-neutral-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900">{item.file.name}</p>
        <p className="text-xs text-neutral-500">{formatFileSize(item.file.size)}</p>

        {(item.status === 'uploading' || item.status === 'completed') && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                item.status === 'completed' ? 'bg-success-500' : 'bg-primary-500',
              )}
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}

        {item.error && (
          <p className="mt-1 text-xs text-error-600">{item.error}</p>
        )}
      </div>

      <div className="shrink-0">
        {item.status === 'error' && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
        {(item.status === 'uploading' || item.status === 'pending') && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {(item.status === 'completed' || item.status === 'cancelled') && (
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
