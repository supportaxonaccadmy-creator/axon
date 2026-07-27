import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Archive, RotateCcw, Trash2, CheckCircle2, EyeOff, Download, Calendar, Hash, ExternalLink } from 'lucide-react';
import { attachmentService } from '@/services/lms/attachmentService';
import { classService } from '@/services/lms/classService';
import type { Attachment, Class } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { ContentStatusBadge, FileIcon, formatFileSize } from '@/components/admin/content';
import { ConfirmDialog } from '@/components/admin/common';
import { format } from 'date-fns';
import type { LmsStatus } from '@/types/lms';

export function AttachmentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [cls, setCls] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    attachmentService.getById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'Attachment not found'); setLoading(false); return; }
      setAttachment(data as Attachment);
      const { data: clsData } = await classService.getById((data as Attachment).classId);
      if (clsData) setCls(clsData as Class);
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (newStatus: LmsStatus) => { if (!id) return; setActionLoading(true); await attachmentService.update(id, { status: newStatus }); setActionLoading(false); setAttachment((a) => a ? { ...a, status: newStatus } : a); };
  const handleDuplicate = async () => { if (!attachment) return; setActionLoading(true); await attachmentService.create({ classId: attachment.classId, title: `${attachment.title} (Copy)`, fileUrl: attachment.fileUrl, fileType: attachment.fileType, fileSize: attachment.fileSize, sortOrder: attachment.sortOrder + 1, status: 'draft' }); setActionLoading(false); navigate('/admin/attachments'); };
  const handleDelete = async () => { if (!id) return; setActionLoading(true); await attachmentService.remove(id); setActionLoading(false); navigate('/admin/attachments'); };

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !attachment) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Attachment not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/attachments')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{attachment.title}</h1>
        <ContentStatusBadge status={attachment.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/attachments/${attachment.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={actionLoading}><Copy className="h-3.5 w-3.5" />Duplicate</Button>
        {attachment.status === 'published' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
        : attachment.status === 'archived' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
        : <Button variant="success" size="sm" onClick={() => handleStatusChange('published')} disabled={actionLoading}><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>}
        {attachment.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => handleStatusChange('archived')} disabled={actionLoading}><Archive className="h-3.5 w-3.5" />Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <FileIcon fileType={attachment.fileType} fileName={attachment.title} className="h-16 w-16" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-neutral-900">{attachment.title}</p>
                <p className="text-sm text-neutral-500">{attachment.fileType ?? 'Unknown'} · {formatFileSize(attachment.fileSize)}</p>
              </div>
              {attachment.fileUrl && (
                <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" />Download</Button></a>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Attachment Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">ID:</span><span className="font-mono text-sm text-neutral-900">{attachment.id}</span></div>
              {cls && <div className="flex items-center gap-3"><Edit className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Class:</span><span className="text-sm font-medium text-neutral-900">{cls.title}</span></div>}
              {attachment.fileType && <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Type:</span><span className="text-sm text-neutral-900">{attachment.fileType}</span></div>}
              {attachment.fileSize !== null && <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Size:</span><span className="text-sm text-neutral-900">{formatFileSize(attachment.fileSize)}</span></div>}
              {attachment.fileUrl && <div className="flex items-center gap-3"><ExternalLink className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">URL:</span><a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-primary-600 hover:underline">{attachment.fileUrl}</a></div>}
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Created:</span><span className="text-sm text-neutral-900">{format(new Date(attachment.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Attachment" message="Are you sure you want to delete this attachment?" confirmLabel="Delete" loading={actionLoading} />
    </div>
  );
}
