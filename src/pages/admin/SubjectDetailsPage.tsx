import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, BookOpen, FileText, Layers, Calendar, Hash, Copy, Archive, RotateCcw, Trash2, CheckCircle2, EyeOff } from 'lucide-react';
import { subjectService } from '@/services/lms/subjectService';
import { batchService } from '@/services/lms/batchService';
import { chapterService } from '@/services/lms/chapterService';
import type { Subject, Batch, Chapter } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge, ConfirmDialog } from '@/components/admin/common';
import { format } from 'date-fns';
import type { LmsStatus } from '@/types/lms';

export function SubjectDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    subjectService.getById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'Subject not found'); setLoading(false); return; }
      setSubject(data as Subject);
      const { data: batchData } = await batchService.getById((data as Subject).batchId);
      if (batchData) setBatch(batchData as Batch);
      const { data: chapterData } = await chapterService.list({ subjectId: id });
      setChapters(chapterData ?? []);
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (newStatus: LmsStatus) => {
    if (!id) return;
    setActionLoading(true);
    await subjectService.update(id, { status: newStatus });
    setActionLoading(false);
    setSubject((s) => s ? { ...s, status: newStatus } : s);
  };

  const handleDuplicate = async () => {
    if (!subject) return;
    setActionLoading(true);
    await subjectService.create({ batchId: subject.batchId, title: `${subject.title} (Copy)`, slug: `${subject.slug}-copy-${Date.now().toString(36)}`, description: subject.description, icon: subject.icon, status: 'draft', sortOrder: subject.sortOrder + 1 });
    setActionLoading(false);
    navigate('/admin/subjects');
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    await subjectService.remove(id);
    setActionLoading(false);
    navigate('/admin/subjects');
  };

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !subject) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Subject not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/subjects')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{subject.title}</h1>
        <StatusBadge status={subject.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/subjects/${subject.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={actionLoading}><Copy className="h-3.5 w-3.5" />Duplicate</Button>
        {subject.status === 'published' ? (
          <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
        ) : subject.status === 'archived' ? (
          <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
        ) : (
          <Button variant="success" size="sm" onClick={() => handleStatusChange('published')} disabled={actionLoading}><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>
        )}
        {subject.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => handleStatusChange('archived')} disabled={actionLoading}><Archive className="h-3.5 w-3.5" />Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Subject Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Title:</span><span className="text-sm font-medium text-neutral-900">{subject.title}</span></div>
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Slug:</span><span className="font-mono text-sm text-neutral-900">/{subject.slug}</span></div>
              {subject.description && <div className="flex items-start gap-3"><FileText className="mt-0.5 h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Description:</span><span className="text-sm text-neutral-900">{subject.description}</span></div>}
              {batch && <div className="flex items-center gap-3"><Layers className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Batch:</span><Link to={`/admin/batches`} className="text-sm font-medium text-primary-600 hover:underline">{batch.title}</Link></div>}
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Sort Order:</span><span className="text-sm font-medium text-neutral-900">{subject.sortOrder}</span></div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Created:</span><span className="text-sm text-neutral-900">{format(new Date(subject.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Updated:</span><span className="text-sm text-neutral-900">{format(new Date(subject.updatedAt), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-800">Chapters ({chapters.length})</h2>
              <Button size="sm" variant="outline" onClick={() => navigate(`/admin/chapters/new?subjectId=${subject.id}`)}>Add Chapter</Button>
            </div>
            {chapters.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">No chapters in this subject yet.</p>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter, idx) => (
                  <div key={chapter.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">{idx + 1}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-900">{chapter.title}</p><p className="truncate text-xs text-neutral-500">/{chapter.slug}</p></div>
                    <StatusBadge status={chapter.status} />
                    <Link to={`/admin/chapters/${chapter.id}`} className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600"><Edit className="h-3.5 w-3.5" /></Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Chapters</span><Badge variant="primary">{chapters.length}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Published</span><Badge variant="success">{chapters.filter((c) => c.status === 'published').length}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Drafts</span><Badge variant="warning">{chapters.filter((c) => c.status === 'draft').length}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Archived</span><Badge variant="default">{chapters.filter((c) => c.status === 'archived').length}</Badge></div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Subject" message="Are you sure you want to delete this subject? All chapters within it will also be affected. This action cannot be undone." confirmLabel="Delete" loading={actionLoading} />
    </div>
  );
}
