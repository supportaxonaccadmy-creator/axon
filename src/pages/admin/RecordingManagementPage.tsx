import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, PlayCircle, Video, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { recordingService } from '@/services/live';
import { useCurrentUser } from '@/hooks/useProfile';
import { RECORDING_SOURCE_LABELS, formatRelativeTime } from '@/services/live';
import type { LiveRecording, RecordingSource } from '@/services/live';
import type { Option } from '@/types/common';

export function RecordingManagementPage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const [recordings, setRecordings] = useState<LiveRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LiveRecording | null>(null);
  const [form, setForm] = useState({ title: '', description: '', source: 'external_url' as RecordingSource, url: '', downloadUrl: '', thumbnailUrl: '', durationSeconds: '', batchId: '', liveClassId: '' });

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    const { data } = await recordingService.getAll();
    setRecordings(data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchRecordings(); }, [fetchRecordings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;

    const input = {
      title: form.title.trim(),
      description: form.description || null,
      source: form.source,
      url: form.url.trim(),
      downloadUrl: form.downloadUrl || null,
      thumbnailUrl: form.thumbnailUrl || null,
      durationSeconds: form.durationSeconds ? Number(form.durationSeconds) : null,
      batchId: form.batchId || null,
      liveClassId: form.liveClassId || null,
    };

    if (editing) {
      await recordingService.update(editing.id, input);
    } else {
      await recordingService.create(adminId, input);
    }

    setForm({ title: '', description: '', source: 'external_url', url: '', downloadUrl: '', thumbnailUrl: '', durationSeconds: '', batchId: '', liveClassId: '' });
    setEditing(null);
    setShowForm(false);
    void fetchRecordings();
  };

  const handleEdit = (r: LiveRecording) => {
    setEditing(r);
    setForm({
      title: r.title, description: r.description ?? '', source: r.source, url: r.url,
      downloadUrl: r.downloadUrl ?? '', thumbnailUrl: r.thumbnailUrl ?? '',
      durationSeconds: r.durationSeconds ? String(r.durationSeconds) : '',
      batchId: r.batchId ?? '', liveClassId: r.liveClassId ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await recordingService.delete(id);
    void fetchRecordings();
  };

  const sourceOptions: Option[] = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo', label: 'Vimeo' },
    { value: 'supabase_storage', label: 'Supabase Storage' },
    { value: 'external_url', label: 'External URL' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Recording Library</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage recorded live class sessions</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ title: '', description: '', source: 'external_url', url: '', downloadUrl: '', thumbnailUrl: '', durationSeconds: '', batchId: '', liveClassId: '' }); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Recording
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit Recording' : 'Add Recording'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
                <Select label="Source" options={sourceOptions} value={form.source} onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value as RecordingSource }))} />
              </div>
              <Input label="URL" value={form.url} onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://..." required />
              <Input label="Description (optional)" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Thumbnail URL (optional)" value={form.thumbnailUrl} onChange={(e) => setForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))} />
                <Input label="Download URL (optional)" value={form.downloadUrl} onChange={(e) => setForm((prev) => ({ ...prev, downloadUrl: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Duration (seconds)" type="number" value={form.durationSeconds} onChange={(e) => setForm((prev) => ({ ...prev, durationSeconds: e.target.value }))} />
                <Input label="Batch ID (optional)" value={form.batchId} onChange={(e) => setForm((prev) => ({ ...prev, batchId: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-neutral-500">Loading...</div>
      ) : recordings.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Video className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No recordings yet</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {recordings.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                {r.source === 'youtube' ? <PlayCircle className="h-5 w-5 text-red-500" /> : r.source === 'vimeo' ? <Video className="h-5 w-5 text-blue-500" /> : <Link2 className="h-5 w-5 text-neutral-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">{r.title}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Badge variant="info">{RECORDING_SOURCE_LABELS[r.source]}</Badge>
                  <span>{formatRelativeTime(r.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(r)} className="rounded-md p-1.5 text-primary-600 hover:bg-primary-50" aria-label="Edit"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(r.id)} className="rounded-md p-1.5 text-error-500 hover:bg-error-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
