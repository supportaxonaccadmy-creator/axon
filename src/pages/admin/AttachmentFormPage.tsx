import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { attachmentService } from '@/services/lms/attachmentService';
import { classService } from '@/services/lms/classService';
import type { Class, Attachment } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { FileIcon } from '@/components/admin/content';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

const STATUS_OPTIONS: Option[] = [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }];

interface AttachmentFormPageProps { mode: 'create' | 'edit'; }

export function AttachmentFormPage({ mode }: AttachmentFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ classId: '', title: '', fileUrl: '', fileType: '', fileSize: 0, sortOrder: 0, status: 'draft' as string });

  useEffect(() => {
    classService.list().then(({ data }) => {
      setClasses(data ?? []);
      if (mode === 'create' && data && data.length > 0) setForm((f) => ({ ...f, classId: data[0]!.id }));
    });
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      attachmentService.getById(id).then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? 'Attachment not found'); setLoading(false); return; }
        const a = data as Attachment;
        setForm({ classId: a.classId, title: a.title, fileUrl: a.fileUrl ?? '', fileType: a.fileType ?? '', fileSize: a.fileSize ?? 0, sortOrder: a.sortOrder, status: a.status });
        setLoading(false);
      });
    }
  }, [mode, id]);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!form.classId) errs.classId = 'Class is required';
    if (!form.title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!validate()) return;
    setSaving(true);
    const payload = { classId: form.classId, title: form.title.trim(), fileUrl: form.fileUrl.trim() || null, fileType: form.fileType.trim() || null, fileSize: Number(form.fileSize) || null, sortOrder: Number(form.sortOrder) || 0, status: form.status as LmsStatus };
    const result = mode === 'create' ? await attachmentService.create(payload) : await attachmentService.update(id!, payload);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    navigate('/admin/attachments');
  }, [form, id, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  const classOptions: Option[] = classes.map((c) => ({ label: c.title, value: c.id }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/attachments')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Attachment' : 'Edit Attachment'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Select label="Class" options={classOptions} placeholder="Select a class" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} error={errors.classId ?? ''} />
        <Input label="Title" placeholder="e.g. Supplementary Materials" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
        <Input label="File URL" placeholder="https://..." value={form.fileUrl} onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))} />
        <Input label="File Type" placeholder="e.g. pdf, zip, docx" value={form.fileType} onChange={(e) => setForm((f) => ({ ...f, fileType: e.target.value }))} hint="File extension or MIME type" />
        <Input label="File Size (bytes)" type="number" value={form.fileSize} onChange={(e) => setForm((f) => ({ ...f, fileSize: Number(e.target.value) }))} />
        <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
        <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        <div className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
          <FileIcon fileType={form.fileType} fileName={form.title} className="h-12 w-12" />
          <span className="text-sm text-neutral-500">File preview icon</span>
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/attachments')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Attachment' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
