import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Archive, RotateCcw, Trash2, CheckCircle2, EyeOff, Calendar, Hash } from 'lucide-react';
import { pdfService } from '@/services/lms/pdfService';
import { classService } from '@/services/lms/classService';
import type { PdfNote, Class } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { ContentStatusBadge, PdfPreview } from '@/components/admin/content';
import { ConfirmDialog } from '@/components/admin/common';
import { format } from 'date-fns';
import type { LmsStatus } from '@/types/lms';

export function PdfDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pdf, setPdf] = useState<PdfNote | null>(null);
  const [cls, setCls] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    pdfService.getById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'PDF not found'); setLoading(false); return; }
      setPdf(data as PdfNote);
      const { data: clsData } = await classService.getById((data as PdfNote).classId);
      if (clsData) setCls(clsData as Class);
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (newStatus: LmsStatus) => { if (!id) return; setActionLoading(true); await pdfService.update(id, { status: newStatus }); setActionLoading(false); setPdf((p) => p ? { ...p, status: newStatus } : p); };
  const handleDuplicate = async () => { if (!pdf) return; setActionLoading(true); await pdfService.create({ classId: pdf.classId, title: `${pdf.title} (Copy)`, slug: `${pdf.slug}-copy-${Date.now().toString(36)}`, description: pdf.description, fileUrl: pdf.fileUrl, totalPages: pdf.totalPages, fileSize: pdf.fileSize, isDownloadable: pdf.isDownloadable, sortOrder: pdf.sortOrder + 1, status: 'draft' }); setActionLoading(false); navigate('/admin/pdfs'); };
  const handleDelete = async () => { if (!id) return; setActionLoading(true); await pdfService.remove(id); setActionLoading(false); navigate('/admin/pdfs'); };

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !pdf) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'PDF not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pdfs')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{pdf.title}</h1>
        <ContentStatusBadge status={pdf.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/pdfs/${pdf.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={actionLoading}><Copy className="h-3.5 w-3.5" />Duplicate</Button>
        {pdf.status === 'published' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
        : pdf.status === 'archived' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
        : <Button variant="success" size="sm" onClick={() => handleStatusChange('published')} disabled={actionLoading}><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>}
        {pdf.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => handleStatusChange('archived')} disabled={actionLoading}><Archive className="h-3.5 w-3.5" />Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PdfPreview fileUrl={pdf.fileUrl} title={pdf.title} fileSize={pdf.fileSize} pages={pdf.totalPages} isDownloadable={pdf.isDownloadable} />
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">PDF Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Slug:</span><span className="font-mono text-sm text-neutral-900">/{pdf.slug}</span></div>
              {pdf.description && <div className="flex items-start gap-3"><Edit className="mt-0.5 h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Description:</span><span className="text-sm text-neutral-900">{pdf.description}</span></div>}
              {cls && <div className="flex items-center gap-3"><Edit className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Class:</span><span className="text-sm font-medium text-neutral-900">{cls.title}</span></div>}
              {pdf.totalPages && <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Pages:</span><span className="text-sm text-neutral-900">{pdf.totalPages}</span></div>}
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Created:</span><span className="text-sm text-neutral-900">{format(new Date(pdf.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete PDF" message="Are you sure you want to delete this PDF?" confirmLabel="Delete" loading={actionLoading} />
    </div>
  );
}
