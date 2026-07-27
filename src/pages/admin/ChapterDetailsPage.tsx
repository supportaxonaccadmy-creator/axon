import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, BookOpen, Layers, Calendar, Hash, Copy, Archive, RotateCcw, Trash2, CheckCircle2, EyeOff, Video } from 'lucide-react';
import { chapterService } from '@/services/lms/chapterService';
import { subjectService } from '@/services/lms/subjectService';
import { classService } from '@/services/lms/classService';
import type { Chapter, Subject, Batch } from '@/types/lms';
import { batchService } from '@/services/lms/batchService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge, ConfirmDialog } from '@/components/admin/common';
import { format } from 'date-fns';
import type { LmsStatus } from '@/types/lms';

interface ClassWithSlug { id: string; title: string; slug: string; status: string; sortOrder: number; }

export function ChapterDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [classes, setClasses] = useState<ClassWithSlug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    chapterService.getById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'Chapter not found'); setLoading(false); return; }
      const ch = data as Chapter;
      setChapter(ch);
      const { data: subj } = await subjectService.getById(ch.subjectId);
      if (subj) {
        setSubject(subj as Subject);
        const { data: bat } = await batchService.getById((subj as Subject).batchId);
        if (bat) setBatch(bat as Batch);
      }
      const { data: cls } = await classService.list({ chapterId: id });
      setClasses((cls ?? []).map((c) => ({ id: c.id, title: c.title, slug: c.slug, status: c.status, sortOrder: c.sortOrder })));
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (newStatus: LmsStatus) => {
    if (!id) return;
    setActionLoading(true);
    await chapterService.update(id, { status: newStatus });
    setActionLoading(false);
    setChapter((c) => c ? { ...c, status: newStatus } : c);
  };

  const handleDuplicate = async () => {
    if (!chapter) return;
    setActionLoading(true);
    await chapterService.create({ subjectId: chapter.subjectId, title: `${chapter.title} (Copy)`, slug: `${chapter.slug}-copy-${Date.now().toString(36)}`, description: chapter.description, status: 'draft', sortOrder: chapter.sortOrder + 1 });
    setActionLoading(false);
    navigate('/admin/chapters');
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    await chapterService.remove(id);
    setActionLoading(false);
    navigate('/admin/chapters');
  };

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !chapter) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'Chapter not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/chapters')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{chapter.title}</h1>
        <StatusBadge status={chapter.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/chapters/${chapter.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={actionLoading}><Copy className="h-3.5 w-3.5" />Duplicate</Button>
        {chapter.status === 'published' ? (
          <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
        ) : chapter.status === 'archived' ? (
          <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
        ) : (
          <Button variant="success" size="sm" onClick={() => handleStatusChange('published')} disabled={actionLoading}><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>
        )}
        {chapter.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => handleStatusChange('archived')} disabled={actionLoading}><Archive className="h-3.5 w-3.5" />Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Chapter Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Title:</span><span className="text-sm font-medium text-neutral-900">{chapter.title}</span></div>
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Slug:</span><span className="font-mono text-sm text-neutral-900">/{chapter.slug}</span></div>
              {chapter.description && <div className="flex items-start gap-3"><FileText className="mt-0.5 h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Description:</span><span className="text-sm text-neutral-900">{chapter.description}</span></div>}
              {subject && <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Subject:</span><Link to={`/admin/subjects/${subject.id}`} className="text-sm font-medium text-primary-600 hover:underline">{subject.title}</Link></div>}
              {batch && <div className="flex items-center gap-3"><Layers className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Batch:</span><Link to="/admin/batches" className="text-sm font-medium text-primary-600 hover:underline">{batch.title}</Link></div>}
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Sort Order:</span><span className="text-sm font-medium text-neutral-900">{chapter.sortOrder}</span></div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Created:</span><span className="text-sm text-neutral-900">{format(new Date(chapter.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Updated:</span><span className="text-sm text-neutral-900">{format(new Date(chapter.updatedAt), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-800">Classes ({classes.length})</h2>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/classes')}>Manage Classes</Button>
            </div>
            {classes.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">No classes in this chapter yet.</p>
            ) : (
              <div className="space-y-2">
                {classes.map((cls, idx) => (
                  <div key={cls.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">{idx + 1}</span>
                    <Video className="h-4 w-4 text-neutral-400" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-900">{cls.title}</p><p className="truncate text-xs text-neutral-500">/{cls.slug}</p></div>
                    <StatusBadge status={cls.status as LmsStatus} />
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
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Classes</span><Badge variant="primary">{classes.length}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Published</span><Badge variant="success">{classes.filter((c) => c.status === 'published').length}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Drafts</span><Badge variant="warning">{classes.filter((c) => c.status === 'draft').length}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Archived</span><Badge variant="default">{classes.filter((c) => c.status === 'archived').length}</Badge></div>
            </div>
          </div>
          {subject && batch && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800">Hierarchy</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><Layers className="h-4 w-4 text-primary-500" /><span className="font-medium text-neutral-900">{batch.title}</span></div>
                <div className="ml-6 flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-accent-500" /><span className="font-medium text-neutral-900">{subject.title}</span></div>
                <div className="ml-12 flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-success-500" /><span className="font-medium text-primary-700">{chapter.title}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Chapter" message="Are you sure you want to delete this chapter? This action cannot be undone." confirmLabel="Delete" loading={actionLoading} />
    </div>
  );
}
