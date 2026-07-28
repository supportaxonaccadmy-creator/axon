import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Trash2, Replace, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { storageService } from '@/services/storage';
import { formatFileSize, type FileRecord } from '@/services/storage';

export function StorageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      setLoading(true);
      const { data, error: err } = await storageService.getFileById(id);
      if (err) setError(err);
      else setFile(data);
      setLoading(false);

      if (data) {
        const { url } = await storageService.getSignedUrl(data.storageBucket, data.filePath);
        setSignedUrl(url);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!file) return;
    const { error: err } = await storageService.deleteFile(file.id);
    if (err) { setError(err); return; }
    navigate('/admin/storage');
  };

  const handleReplace = async (newFile: File) => {
    if (!file) return;
    const { fileRecord, error: err } = await storageService.replaceFile({ fileId: file.id, newFile });
    if (err) { setError(err); return; }
    if (fileRecord) {
      setFile(fileRecord);
      const { url } = await storageService.getSignedUrl(fileRecord.storageBucket, fileRecord.filePath);
      setSignedUrl(url);
    }
    setReplaceMode(false);
  };

  const handleCopy = async () => {
    if (signedUrl) {
      try { await navigator.clipboard.writeText(signedUrl); } catch { /* ignore */ }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/storage')}>
          <ArrowLeft className="h-4 w-4" /> Back to Storage
        </Button>
        <Card className="p-6 text-center">
          <p className="text-sm text-error-600">{error ?? 'File not found'}</p>
        </Card>
      </div>
    );
  }

  const details: { label: string; value: string }[] = [
    { label: 'File ID', value: file.id },
    { label: 'Original Name', value: file.originalName },
    { label: 'Storage Name', value: file.fileName },
    { label: 'Bucket', value: file.storageBucket },
    { label: 'Path', value: file.filePath },
    { label: 'MIME Type', value: file.mimeType },
    { label: 'File Type', value: file.fileType },
    { label: 'File Size', value: formatFileSize(file.fileSize) },
    { label: 'Entity Type', value: file.entityType ?? '—' },
    { label: 'Entity ID', value: file.entityId ?? '—' },
    { label: 'Public', value: file.isPublic ? 'Yes' : 'No' },
    { label: 'Status', value: file.status },
    { label: 'Created', value: new Date(file.createdAt).toLocaleString() },
    { label: 'Updated', value: new Date(file.updatedAt).toLocaleString() },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/storage')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">File Details</h1>
          <p className="mt-1 text-sm text-neutral-500">{file.originalName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {file.fileType === 'image' && signedUrl && (
              <img src={signedUrl} alt={file.originalName} className="max-h-64 w-full rounded-lg object-contain" />
            )}
            {file.fileType === 'pdf' && signedUrl && (
              <iframe src={signedUrl} className="h-64 w-full rounded-lg" title={file.originalName} />
            )}
            {file.fileType === 'video' && signedUrl && (
              <video src={signedUrl} controls className="max-h-64 w-full rounded-lg" />
            )}
            {file.fileType === 'document' && (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-neutral-50">
                <p className="text-sm text-neutral-500">Document preview not available</p>
                {signedUrl && (
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-primary-600 hover:underline">
                    Open in new tab <ExternalLink className="ml-1 inline h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {details.map((d) => (
                <div key={d.label} className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-2">
                  <dt className="shrink-0 text-sm font-medium text-neutral-500">{d.label}</dt>
                  <dd className="truncate text-right text-sm text-neutral-900" title={d.value}>{d.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              {signedUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(signedUrl, '_blank')}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
                <Copy className="h-4 w-4" /> Copy URL
              </Button>
              <Button variant="outline" size="sm" onClick={() => setReplaceMode(true)}>
                <Replace className="h-4 w-4" /> Replace
              </Button>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900">Delete this file?</h3>
            <p className="mt-2 text-sm text-neutral-600">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => void handleDelete()}>Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {replaceMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900">Replace File</h3>
            <p className="mt-2 text-sm text-neutral-600">Select a new file to replace the current one.</p>
            <input
              type="file"
              className="mt-4 w-full"
              onChange={(e) => {
                if (e.target.files?.[0]) void handleReplace(e.target.files[0]);
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReplaceMode(false)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
