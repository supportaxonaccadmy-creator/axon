import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Archive, RotateCcw, Trash2, CheckCircle2, EyeOff, Clock, Calendar, Hash } from 'lucide-react';
import { videoService } from '@/services/lms/videoService';
import { classService } from '@/services/lms/classService';
import type { Video, Class } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { ContentStatusBadge, VideoPreview } from '@/components/admin/content';
import { ConfirmDialog } from '@/components/admin/common';
import { format } from 'date-fns';
import type { LmsStatus } from '@/types/lms';

export function VideoDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [cls, setCls] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    videoService.getById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'Video not found'); setLoading(false); return; }
      setVideo(data as Video);
      const { data: clsData } = await classService.getById((data as Video).classId);
      if (clsData) setCls(clsData as Class);
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (newStatus: LmsStatus) => { if (!id) return; setActionLoading(true); await videoService.update(id, { status: newStatus }); setActionLoading(false); setVideo((v) => v ? { ...v, status: newStatus } : v); };
  const handleDuplicate = async () => { if (!video) return; setActionLoading(true); await videoService.create({ classId: video.classId, title: `${video.title} (Copy)`, slug: `${video.slug}-copy-${Date.now().toString(36)}`, description: video.description, youtubeUrl: video.youtubeUrl, videoUrl: video.videoUrl, duration: video.duration, thumbnail: video.thumbnail, isPreview: video.isPreview, sortOrder: video.sortOrder + 1, status: 'draft' }); setActionLoading(false); navigate('/admin/videos'); };
  const handleDelete = async () => { if (!id) return; setActionLoading(true); await videoService.remove(id); setActionLoading(false); navigate('/admin/videos'); };

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !video) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Video not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/videos')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{video.title}</h1>
        <ContentStatusBadge status={video.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/videos/${video.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={actionLoading}><Copy className="h-3.5 w-3.5" />Duplicate</Button>
        {video.status === 'published' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
        : video.status === 'archived' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
        : <Button variant="success" size="sm" onClick={() => handleStatusChange('published')} disabled={actionLoading}><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>}
        {video.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => handleStatusChange('archived')} disabled={actionLoading}><Archive className="h-3.5 w-3.5" />Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <VideoPreview youtubeUrl={video.youtubeUrl} videoUrl={video.videoUrl} thumbnail={video.thumbnail} title={video.title} />
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Video Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Slug:</span><span className="font-mono text-sm text-neutral-900">/{video.slug}</span></div>
              {video.description && <div className="flex items-start gap-3"><Edit className="mt-0.5 h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Description:</span><span className="text-sm text-neutral-900">{video.description}</span></div>}
              {cls && <div className="flex items-center gap-3"><Edit className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Class:</span><span className="text-sm font-medium text-neutral-900">{cls.title}</span></div>}
              {video.duration && <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Duration:</span><span className="text-sm text-neutral-900">{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span></div>}
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Created:</span><span className="text-sm text-neutral-900">{format(new Date(video.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Video" message="Are you sure you want to delete this video?" confirmLabel="Delete" loading={actionLoading} />
    </div>
  );
}
