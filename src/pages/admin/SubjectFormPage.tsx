import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { subjectService } from '@/services/lms/subjectService';
import { batchService } from '@/services/lms/batchService';
import type { Batch, Subject } from '@/types/lms';
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

interface SubjectFormPageProps { mode: 'create' | 'edit'; }

export function SubjectFormPage({ mode }: SubjectFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ batchId: '', title: '', slug: '', description: '', icon: '', sortOrder: 0, status: 'draft' as string });

  useEffect(() => {
    batchService.list().then((result) => {
      setBatches(result.data);
      if (mode === 'create' && result.data.length > 0) setForm((f) => ({ ...f, batchId: result.data[0]!.id }));
    });
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      subjectService.getById(id).then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? 'Subject not found'); setLoading(false); return; }
        const s = data as Subject;
        setForm({ batchId: s.batchId, title: s.title, slug: s.slug, description: s.description ?? '', icon: s.icon ?? '', sortOrder: s.sortOrder, status: s.status });
        setLoading(false);
      });
    }
  }, [mode, id]);

  const validate = useCallback(async (): Promise<boolean> => {
    const errors: Record<string, string> = {};
    if (!form.batchId) errors.batchId = 'Batch is required';
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.slug.trim()) errors.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errors.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    else {
      const { data: existing } = await subjectService.getBySlug(form.batchId, form.slug);
      if (existing && existing.id !== id) errors.slug = 'Slug already exists in this batch';
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
    const payload = { batchId: form.batchId, title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim() || null, icon: form.icon.trim() || null, sortOrder: Number(form.sortOrder) || 0, status: form.status as 'draft' | 'published' | 'archived' };
    const result = mode === 'create' ? await subjectService.create(payload) : await subjectService.update(id!, payload);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    navigate('/admin/subjects');
  }, [form, id, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  const batchOptions: Option[] = batches.map((b) => ({ label: b.title, value: b.id }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/subjects')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Subject' : 'Edit Subject'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Select label="Batch" options={batchOptions} placeholder="Select a batch" value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))} error={validationErrors.batchId ?? ''} />
        <Input label="Title" placeholder="e.g. Anatomy & Physiology" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={validationErrors.title} />
        <Input label="Slug" placeholder="e.g. anatomy-physiology" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} error={validationErrors.slug} hint="Lowercase letters, numbers, and hyphens only" />
        <Textarea label="Description" placeholder="Brief description of the subject..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Input label="Icon (optional)" placeholder="e.g. BookOpen" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} hint="Lucide icon name" />
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
        <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/subjects')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Subject' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
