import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { mcqService } from '@/services/lms/mcqService';
import { classService } from '@/services/lms/classService';
import type { Class, McqSet } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

const STATUS_OPTIONS: Option[] = [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }];

interface McqFormPageProps { mode: 'create' | 'edit'; }

export function McqFormPage({ mode }: McqFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ classId: '', title: '', slug: '', description: '', instructions: '', durationMinutes: 0, totalMarks: 0, passingMarks: 0, attemptsAllowed: 0, shuffleQuestions: false, showResult: true, sortOrder: 0, status: 'draft' as string });

  useEffect(() => {
    classService.list().then(({ data }) => {
      setClasses(data ?? []);
      if (mode === 'create' && data && data.length > 0) setForm((f) => ({ ...f, classId: data[0]!.id }));
    });
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      mcqService.getSetById(id).then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? 'MCQ set not found'); setLoading(false); return; }
        const s = data as McqSet;
        setForm({ classId: s.classId, title: s.title, slug: s.slug, description: s.description ?? '', instructions: s.instructions ?? '', durationMinutes: s.durationMinutes ?? 0, totalMarks: s.totalMarks, passingMarks: s.passingMarks, attemptsAllowed: s.attemptsAllowed ?? 0, shuffleQuestions: s.shuffleQuestions, showResult: s.showResult, sortOrder: s.sortOrder, status: s.status });
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
      const { data: existing } = await mcqService.getSetBySlug(form.classId, form.slug);
      if (existing && existing.id !== id) errs.slug = 'Slug already exists in this class';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!(await validate())) return;
    setSaving(true);
    const payload = { classId: form.classId, title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim() || null, instructions: form.instructions.trim() || null, durationMinutes: Number(form.durationMinutes) || null, totalMarks: Number(form.totalMarks) || 0, passingMarks: Number(form.passingMarks) || 0, attemptsAllowed: Number(form.attemptsAllowed) || null, shuffleQuestions: form.shuffleQuestions, showResult: form.showResult, sortOrder: Number(form.sortOrder) || 0, status: form.status as LmsStatus };
    const result = mode === 'create' ? await mcqService.createSet(payload) : await mcqService.updateSet(id!, payload);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    navigate('/admin/mcq');
  }, [form, id, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  const classOptions: Option[] = classes.map((c) => ({ label: c.title, value: c.id }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/mcq')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New MCQ Set' : 'Edit MCQ Set'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Select label="Class" options={classOptions} placeholder="Select a class" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} error={errors.classId ?? ''} />
        <Input label="Title" placeholder="e.g. Chapter 1 Quiz" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
        <Input label="Slug" placeholder="e.g. chapter-1-quiz" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} error={errors.slug} hint="Lowercase letters, numbers, and hyphens only" />
        <Textarea label="Description" placeholder="Brief description..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Textarea label="Instructions" placeholder="Instructions for students..." value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Input label="Duration (min)" type="number" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} />
          <Input label="Total Marks" type="number" value={form.totalMarks} onChange={(e) => setForm((f) => ({ ...f, totalMarks: Number(e.target.value) }))} />
          <Input label="Passing Marks" type="number" value={form.passingMarks} onChange={(e) => setForm((f) => ({ ...f, passingMarks: Number(e.target.value) }))} />
        </div>
        <Input label="Attempts Allowed" type="number" value={form.attemptsAllowed} onChange={(e) => setForm((f) => ({ ...f, attemptsAllowed: Number(e.target.value) }))} hint="0 for unlimited" />
        <div className="flex items-center gap-6">
          <Checkbox label="Shuffle Questions" checked={form.shuffleQuestions} onChange={(e) => setForm((f) => ({ ...f, shuffleQuestions: e.target.checked }))} />
          <Checkbox label="Show Result" checked={form.showResult} onChange={(e) => setForm((f) => ({ ...f, showResult: e.target.checked }))} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/mcq')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create MCQ Set' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
