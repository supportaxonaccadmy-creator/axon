import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { videoService } from '@/services/lms/videoService';
import { classService } from '@/services/lms/classService';
import type { Class, Video } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { VideoPreview, extractYouTubeId } from '@/components/admin/content';
import type { Option } from '@/types/common';
import type { LmsStatus } from '@/types/lms';

const STATUS_OPTIONS: Option[] = [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }];

interface VideoFormPageProps { mode: 'create' | 'edit'; }

export function VideoFormPage({ mode }: VideoFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ classId: '', title: '', slug: '', description: '', youtubeUrl: '', videoUrl: '', duration: 0, thumbnail: '', isPreview: false, status: 'draft' as string });

  useEffect(() => {
    classService.list().then(({ data }) => {
      setClasses(data ?? []);
      if (mode === 'create' && data && data.length > 0) setForm((f) => ({ ...f, classId: data[0]!.id }));
    });
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      videoService.getById(id).then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? 'Video not found'); setLoading(false); return; }
        const v = data as Video;
        setForm({ classId: v.classId, title: v.title, slug: v.slug, description: v.description ?? '', youtubeUrl: v.youtubeUrl ?? '', videoUrl: v.videoUrl ?? '', duration: v.duration ?? 0, thumbnail: v.thumbnail ?? '', isPreview: v.isPreview, status: v.status });
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
      const { data: existing } = await videoService.getBySlug(form.classId, form.slug);
      if (existing && existing.id !== id) errs.slug = 'Slug already exists in this class';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!(await validate())) return;
    setSaving(true);
    const payload = { classId: form.classId, title: form.title.trim(), slug: form.slug.trim(), description: form.description.trim() || null, youtubeUrl: form.youtubeUrl.trim() || null, videoUrl: form.videoUrl.trim() || null, duration: Number(form.duration) || null, thumbnail: form.thumbnail.trim() || null, isPreview: form.isPreview, status: form.status as LmsStatus };
    const result = mode === 'create' ? await videoService.create(payload) : await videoService.update(id!, payload);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    navigate('/admin/videos');
  }, [form, id, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  const classOptions: Option[] = classes.map((c) => ({ label: c.title, value: c.id }));
  const ytId = form.youtubeUrl ? extractYouTubeId(form.youtubeUrl) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/videos')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Video' : 'Edit Video'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Select label="Class" options={classOptions} placeholder="Select a class" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} error={errors.classId ?? ''} />
          <Input label="Title" placeholder="e.g. Lecture 1: Introduction" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
          <Input label="Slug" placeholder="e.g. lecture-1-introduction" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} error={errors.slug} hint="Lowercase letters, numbers, and hyphens only" />
          <Textarea label="Description" placeholder="Brief description..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="YouTube URL" placeholder="https://youtube.com/watch?v=..." value={form.youtubeUrl} onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))} hint={ytId ? `YouTube ID: ${ytId}` : 'Paste a YouTube URL'} />
          <Input label="Direct Video URL (optional)" placeholder="https://...mp4" value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} />
          <Input label="Thumbnail URL" placeholder="https://..." value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))} />
          <Input label="Duration (seconds)" type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))} />
          <Checkbox label="Preview (free access)" checked={form.isPreview} onChange={(e) => setForm((f) => ({ ...f, isPreview: e.target.checked }))} />
          <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/videos')}>Cancel</Button>
            <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Video' : 'Save Changes'}</Button>
          </div>
        </form>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-800">Preview</h3>
          <VideoPreview youtubeUrl={form.youtubeUrl} videoUrl={form.videoUrl} thumbnail={form.thumbnail} title={form.title} />
        </div>
      </div>
    </div>
  );
}
