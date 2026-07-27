import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { pdfService } from '@/services/lms/pdfService';
import { classService } from '@/services/lms/classService';
import type { Class, PdfNote } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { PdfPreview } from '@/components/admin/content';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

const STATUS_OPTIONS: Option[] = [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }];

interface PdfFormPageProps { mode: 'create' | 'edit'; }

export function PdfFormPage({ mode }: PdfFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ classId: '', title: '', slug: '', description: '', fileUrl: '', totalPages: 0, fileSize: 0, isDownloadable: true, sortOrder: 0, status: 'draft' as string });

  useEffect(() => {
    classService.list().then(({ data }) => {
      setClasses(data ?? []);
      if (mode === 'create' && data && data.length > 0) setForm((f) => ({ ...f, classId: data[0]!.id }));
    });
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      pdfService.getById(id).then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? 'PDF not found'); setLoading(false); return; }
        const p = data as PdfNote;
        setForm({ classId: p.classId, title: p.title, slug: p.slug, description: p.description ?? '', fileUrl: p.fileUrl ?? '', totalPages: p.totalPages ?? 0, fileSize: p.fileSize ?? 0, isDownloadable: p.isDownloadable, sortOrder: p.sortOrder, status: p.status });
        setLoading(false);
      });
    }
  }, [mode, id]);

  const validate = useCallback(async (): Promise<boolean> => {
    const errs: Record<string, string> = {};
    if (!form.classId) errs.classId = 'Class is required';
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    else {
      const { data: existing } = await pdfService.getBySlug(form.classId, form.slug);
      if (existing && existing.id !== id) errs.slug = 'Slug already exists in this class';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!(await validate())) return;
    setSaving(true);
    const payload = { classId: form.classId, title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim() || null, fileUrl: form.fileUrl.trim() || null, totalPages: Number(form.totalPages) || null, fileSize: Number(form.fileSize) || null, isDownloadable: form.isDownloadable, sortOrder: Number(form.sortOrder) || 0, status: form.status as LmsStatus };
    const result = mode === 'create' ? await pdfService.create(payload) : await pdfService.update(id!, payload);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    navigate('/admin/pdfs');
  }, [form, id, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  const classOptions: Option[] = classes.map((c) => ({ label: c.title, value: c.id }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pdfs')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New PDF Note' : 'Edit PDF Note'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Select label="Class" options={classOptions} placeholder="Select a class" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} error={errors.classId ?? ''} />
          <Input label="Title" placeholder="e.g. Chapter 1 Notes" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
          <Input label="Slug" placeholder="e.g. chapter-1-notes" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} error={errors.slug} hint="Lowercase letters, numbers, and hyphens only" />
          <Textarea label="Description" placeholder="Brief description..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="PDF URL" placeholder="https://..." value={form.fileUrl} onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Pages" type="number" value={form.totalPages} onChange={(e) => setForm((f) => ({ ...f, totalPages: Number(e.target.value) }))} />
            <Input label="File Size (bytes)" type="number" value={form.fileSize} onChange={(e) => setForm((f) => ({ ...f, fileSize: Number(e.target.value) }))} />
          </div>
          <Checkbox label="Downloadable" checked={form.isDownloadable} onChange={(e) => setForm((f) => ({ ...f, isDownloadable: e.target.checked }))} />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/pdfs')}>Cancel</Button>
            <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create PDF' : 'Save Changes'}</Button>
          </div>
        </form>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-800">Preview</h3>
          <PdfPreview fileUrl={form.fileUrl} title={form.title} fileSize={form.fileSize} pages={form.totalPages} isDownloadable={form.isDownloadable} />
        </div>
      </div>
    </div>
  );
}
