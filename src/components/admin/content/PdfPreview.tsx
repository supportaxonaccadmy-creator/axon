import { memo, useState } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PdfPreviewProps {
  fileUrl?: string | null;
  title?: string;
  fileSize?: number | null;
  pages?: number | null;
  isDownloadable?: boolean;
  compact?: boolean;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function PdfPreviewComponent({ fileUrl, title, fileSize, pages, isDownloadable, compact = false }: PdfPreviewProps) {
  const [previewing, setPreviewing] = useState(false);

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-50"><FileText className="h-4 w-4 text-error-600" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">{title ?? 'PDF'}</p>
            <p className="text-xs text-neutral-500">{formatFileSize(fileSize)}{pages ? ` · ${pages} pages` : ''}</p>
          </div>
          {fileUrl && <button onClick={() => setPreviewing(true)} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Preview"><Eye className="h-3.5 w-3.5" /></button>}
        </div>
        {previewing && fileUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewing(false)}>
            <div className="relative w-full max-w-4xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setPreviewing(false)} className="absolute -top-10 right-0 text-white hover:text-neutral-300" aria-label="Close"><X className="h-6 w-6" /></button>
              <iframe src={fileUrl} title={title ?? 'PDF'} className="h-full w-full rounded-lg bg-white" />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error-50"><FileText className="h-6 w-6 text-error-600" /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{title ?? 'PDF Document'}</p>
          <p className="text-xs text-neutral-500">{formatFileSize(fileSize)}{pages ? ` · ${pages} pages` : ''}</p>
        </div>
      </div>
      {fileUrl && (
        <div className="flex gap-2 border-t border-neutral-100 p-3">
          <Button size="sm" variant="outline" onClick={() => setPreviewing(true)}><Eye className="h-3.5 w-3.5" />Preview</Button>
          {isDownloadable && <a href={fileUrl} download target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" />Download</Button></a>}
        </div>
      )}
      {previewing && fileUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewing(false)}>
          <div className="relative w-full max-w-4xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewing(false)} className="absolute -top-10 right-0 text-white hover:text-neutral-300" aria-label="Close"><X className="h-6 w-6" /></button>
            <iframe src={fileUrl} title={title ?? 'PDF'} className="h-full w-full rounded-lg bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}

export const PdfPreview = memo(PdfPreviewComponent);
export { formatFileSize };
