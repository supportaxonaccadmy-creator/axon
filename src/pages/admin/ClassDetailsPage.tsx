import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Archive, RotateCcw, Trash2, CheckCircle2, EyeOff, Clock, FileText, Paperclip, Calendar, Hash, Video as VideoIcon } from 'lucide-react';
import { classService } from '@/services/lms/classService';
import { chapterService } from '@/services/lms/chapterService';
import { videoService } from '@/services/lms/videoService';
import { pdfService } from '@/services/lms/pdfService';
import { attachmentService } from '@/services/lms/attachmentService';
import type { Class, Chapter, Video as VideoType, PdfNote, Attachment } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ContentStatusBadge, VideoPreview } from '@/components/admin/content';
import { ConfirmDialog } from '@/components/admin/common';
import { format } from 'date-fns';
import type { LmsStatus } from '@/types/lms';

export function ClassDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<Class | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [pdfs, setPdfs] = useState<PdfNote[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    classService.getById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'Class not found'); setLoading(false); return; }
      setCls(data as Class);
      const { data: ch } = await chapterService.getById((data as Class).chapterId);
      if (ch) setChapter(ch as Chapter);
      const [vidRes, pdfRes, attRes] = await Promise.all([
        videoService.list({ classId: id }), pdfService.list({ classId: id }), attachmentService.list({ classId: id }),
      ]);
      setVideos(vidRes.data ?? []); setPdfs(pdfRes.data ?? []); setAttachments(attRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (newStatus: LmsStatus) => { if (!id) return; setActionLoading(true); await classService.update(id, { status: newStatus }); setActionLoading(false); setCls((c) => c ? { ...c, status: newStatus } : c); };
  const handleDuplicate = async () => { if (!cls) return; setActionLoading(true); await classService.create({ chapterId: cls.chapterId, title: `${cls.title} (Copy)`, slug: `${cls.slug}-copy-${Date.now().toString(36)}`, description: cls.description, thumbnail: cls.thumbnail, duration: cls.duration, sortOrder: cls.sortOrder + 1, isPreview: cls.isPreview, status: 'draft' }); setActionLoading(false); navigate('/admin/classes'); };
  const handleDelete = async () => { if (!id) return; setActionLoading(true); await classService.remove(id); setActionLoading(false); navigate('/admin/classes'); };

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !cls) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Class not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/classes')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{cls.title}</h1>
        <ContentStatusBadge status={cls.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/classes/${cls.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={actionLoading}><Copy className="h-3.5 w-3.5" />Duplicate</Button>
        {cls.status === 'published' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
        : cls.status === 'archived' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
        : <Button variant="success" size="sm" onClick={() => handleStatusChange('published')} disabled={actionLoading}><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>}
        {cls.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => handleStatusChange('archived')} disabled={actionLoading}><Archive className="h-3.5 w-3.5" />Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Class Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Slug:</span><span className="font-mono text-sm text-neutral-900">/{cls.slug}</span></div>
              {cls.description && <div className="flex items-start gap-3"><FileText className="mt-0.5 h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Description:</span><span className="text-sm text-neutral-900">{cls.description}</span></div>}
              {chapter && <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Chapter:</span><span className="text-sm font-medium text-neutral-900">{chapter.title}</span></div>}
              {cls.duration && <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Duration:</span><span className="text-sm text-neutral-900">{Math.floor(cls.duration / 60)}:{String(cls.duration % 60).padStart(2, '0')}</span></div>}
              {cls.isPreview && <div className="flex items-center gap-3"><Badge variant="success">Preview</Badge></div>}
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Created:</span><span className="text-sm text-neutral-900">{format(new Date(cls.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>
          {videos.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800">Videos ({videos.length})</h2>
              <div className="space-y-3">{videos.map((v) => <VideoPreview key={v.id} youtubeUrl={v.youtubeUrl} videoUrl={v.videoUrl} thumbnail={v.thumbnail} title={v.title} compact />)}</div>
            </div>
          )}
          {pdfs.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800">PDF Notes ({pdfs.length})</h2>
              <div className="space-y-2">{pdfs.map((p) => <div key={p.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3"><FileText className="h-4 w-4 text-error-500" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-900">{p.title}</p><p className="text-xs text-neutral-500">{p.totalPages ?? 0} pages</p></div><ContentStatusBadge status={p.status} /></div>)}</div>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Content Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-neutral-500"><VideoIcon className="h-4 w-4" />Videos</span><Badge variant="primary">{videos.length}</Badge></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-neutral-500"><FileText className="h-4 w-4" />PDFs</span><Badge variant="success">{pdfs.length}</Badge></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-neutral-500"><Paperclip className="h-4 w-4" />Attachments</span><Badge variant="default">{attachments.length}</Badge></div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Class" message="Are you sure you want to delete this class?" confirmLabel="Delete" loading={actionLoading} />
    </div>
  );
}
