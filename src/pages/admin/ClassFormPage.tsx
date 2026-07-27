import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { classService } from '@/services/lms/classService';
import { chapterService } from '@/services/lms/chapterService';
import type { Chapter, Class } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

const STATUS_OPTIONS: Option[] = [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }];

interface ClassFormPageProps { mode: 'create' | 'edit'; }

export function ClassFormPage({ mode }: ClassFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ chapterId: '', title: '', slug: '', description: '', thumbnail: '', duration: 0, sortOrder: 0, isPreview: false, status: 'draft' as string });

  useEffect(() => {
    chapterService.list().then(({ data }) => {
      setChapters(data ?? []);
      if (mode === 'create' && data && data.length > 0) setForm((f) => ({ ...f, chapterId: data[0]!.id }));
    });
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      classService.getById(id).then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? 'Class not found'); setLoading(false); return; }
        const c = data as Class;
        setForm({ chapterId: c.chapterId, title: c.title, slug: c.slug, description: c.description ?? '', thumbnail: c.thumbnail ?? '', duration: c.duration ?? 0, sortOrder: c.sortOrder, isPreview: c.isPreview, status: c.status });
        setLoading(false);
      });
    }
  }, [mode, id]);

  const validate = useCallback(async (): Promise<boolean> => {
    const errs: Record<string, string> = {};
    if (!form.chapterId) errs.chapterId = 'Chapter is required';
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    else {
      const { data: existing } = await classService.getBySlug(form.chapterId, form.slug);
      if (existing && existing.id !== id) errs.slug = 'Slug already exists in this chapter';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!(await validate())) return;
    setSaving(true);
    const payload = { chapterId: form.chapterId, title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim() || null, thumbnail: form.thumbnail.trim() || null, duration: Number(form.duration) || null, sortOrder: Number(form.sortOrder) || 0, isPreview: form.isPreview, status: form.status as LmsStatus };
    const result = mode === 'create' ? await classService.create(payload) : await classService.update(id!, payload);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    navigate('/admin/classes');
  }, [form, id, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  const chapterOptions: Option[] = chapters.map((c) => ({ label: c.title, value: c.id }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/classes')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Class' : 'Edit Class'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Select label="Chapter" options={chapterOptions} placeholder="Select a chapter" value={form.chapterId} onChange={(e) => setForm((f) => ({ ...f, chapterId: e.target.value }))} error={errors.chapterId ?? ''} />
        <Input label="Title" placeholder="e.g. Introduction Lecture" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
        <Input label="Slug" placeholder="e.g. introduction-lecture" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} error={errors.slug} hint="Lowercase letters, numbers, and hyphens only" />
        <Textarea label="Description" placeholder="Brief description..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Input label="Thumbnail URL" placeholder="https://..." value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))} />
        <Input label="Duration (seconds)" type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))} />
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
        <Checkbox label="Preview (free access)" checked={form.isPreview} onChange={(e) => setForm((f) => ({ ...f, isPreview: e.target.checked }))} />
        <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/classes')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Class' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
