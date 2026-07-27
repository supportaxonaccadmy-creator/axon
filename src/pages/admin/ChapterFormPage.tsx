import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { chapterService } from '@/services/lms/chapterService';
import { subjectService } from '@/services/lms/subjectService';
import type { Subject, Chapter } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import type { Option } from '@/types/common';

const STATUS_OPTIONS: Option[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

interface ChapterFormPageProps { mode: 'create' | 'edit'; }

export function ChapterFormPage({ mode }: ChapterFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ subjectId: '', title: '', slug: '', description: '', sortOrder: 0, status: 'draft' as string });

  useEffect(() => {
    subjectService.list().then(({ data }) => {
      setSubjects(data ?? []);
      if (mode === 'create') {
        const preselectedSubjectId = searchParams.get('subjectId');
        if (preselectedSubjectId) setForm((f) => ({ ...f, subjectId: preselectedSubjectId }));
        else if (data && data.length > 0) setForm((f) => ({ ...f, subjectId: data[0]!.id }));
      }
    });
  }, [mode, searchParams]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      chapterService.getById(id).then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? 'Chapter not found'); setLoading(false); return; }
        const c = data as Chapter;
        setForm({ subjectId: c.subjectId, title: c.title, slug: c.slug, description: c.description ?? '', sortOrder: c.sortOrder, status: c.status });
        setLoading(false);
      });
    }
  }, [mode, id]);

  const validate = useCallback(async (): Promise<boolean> => {
    const errors: Record<string, string> = {};
    if (!form.subjectId) errors.subjectId = 'Subject is required';
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.slug.trim()) errors.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errors.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    else {
      const { data: existing } = await chapterService.getBySlug(form.subjectId, form.slug);
      if (existing && existing.id !== id) errors.slug = 'Slug already exists in this subject';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form, id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const valid = await validate();
    if (!valid) return;
    setSaving(true);
    const payload = { subjectId: form.subjectId, title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim() || null, sortOrder: Number(form.sortOrder) || 0, status: form.status as 'draft' | 'published' | 'archived' };
    const result = mode === 'create' ? await chapterService.create(payload) : await chapterService.update(id!, payload);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    navigate('/admin/chapters');
  }, [form, id, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  const subjectOptions: Option[] = subjects.map((s) => ({ label: s.title, value: s.id }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/chapters')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Chapter' : 'Edit Chapter'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Select label="Subject" options={subjectOptions} placeholder="Select a subject" value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))} error={validationErrors.subjectId ?? ''} />
        <Input label="Title" placeholder="e.g. Introduction to Anatomy" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={validationErrors.title} />
        <Input label="Slug" placeholder="e.g. introduction-to-anatomy" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} error={validationErrors.slug} hint="Lowercase letters, numbers, and hyphens only" />
        <Textarea label="Description" placeholder="Brief description of the chapter..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
        <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/chapters')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Chapter' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
