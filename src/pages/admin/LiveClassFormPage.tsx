import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { liveClassService, liveReminderService } from '@/services/live';
import type { MeetingProviderType, RecurringPattern, CreateLiveClassInput } from '@/services/live';
import type { Option } from '@/types/common';

export function LiveClassFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateLiveClassInput>({
    title: '', description: '', providerType: 'custom_url', meetingUrl: '',
    meetingPassword: '', meetingId: '', batchId: '', subjectId: null, chapterId: null, classId: null,
    thumbnailUrl: null, bannerUrl: null, startTime: '', endTime: '', timezone: 'UTC',
    recurring: 'none', recurringInterval: null, recurringEndDate: null,
    waitingRoom: false, maxParticipants: null, allowRecording: true, autoRecording: false,
  });

  useEffect(() => {
    if (id) {
      void liveClassService.getById(id).then(({ data, error: err }) => {
        if (err) setError(err);
        else if (data) {
          setForm({
            title: data.title, description: data.description, providerType: data.providerType,
            meetingUrl: data.meetingUrl, meetingPassword: data.meetingPassword, meetingId: data.meetingId,
            batchId: data.batchId ?? '', subjectId: data.subjectId, chapterId: data.chapterId, classId: data.classId,
            thumbnailUrl: data.thumbnailUrl, bannerUrl: data.bannerUrl,
            startTime: data.startTime.slice(0, 16), endTime: data.endTime.slice(0, 16),
            timezone: data.timezone, recurring: data.recurring, recurringInterval: data.recurringInterval,
            recurringEndDate: data.recurringEndDate, waitingRoom: data.waitingRoom,
            maxParticipants: data.maxParticipants, allowRecording: data.allowRecording, autoRecording: data.autoRecording,
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.meetingUrl || !form.meetingUrl.trim() || !form.batchId || !form.startTime || !form.endTime) return;
    setSaving(true);
    setError(null);
    const input = { ...form, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString() };
    if (isEdit && id) {
      const { error: err } = await liveClassService.update(id, input);
      if (err) setError(err);
      else navigate(`/admin/live-classes/${id}`);
    } else {
      const { data, error: err } = await liveClassService.create(input);
      if (err) setError(err);
      else if (data) {
        await liveReminderService.createDefaultReminders(data.id, data.startTime);
        navigate(`/admin/live-classes/${data.id}`);
      }
    }
    setSaving(false);
  }, [form, isEdit, id, navigate]);

  const providerOptions: Option[] = [
    { value: 'zoom', label: 'Zoom' }, { value: 'google_meet', label: 'Google Meet' },
    { value: 'jitsi_meet', label: 'Jitsi Meet' }, { value: 'microsoft_teams', label: 'Microsoft Teams' },
    { value: 'youtube_live', label: 'YouTube Live' }, { value: 'custom_url', label: 'Custom URL' },
  ];
  const recurringOptions: Option[] = [
    { value: 'none', label: 'One-time' }, { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'custom', label: 'Custom' },
  ];

  const update = (field: keyof typeof form, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Go back"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-bold text-neutral-900">{isEdit ? 'Edit Live Class' : 'Create Live Class'}</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Class Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
            <Textarea label="Description" value={form.description ?? ''} onChange={(e) => update('description', e.target.value)} rows={3} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Meeting Provider" options={providerOptions} value={form.providerType} onChange={(e) => update('providerType', e.target.value as MeetingProviderType)} />
              <Input label="Meeting URL" value={form.meetingUrl ?? ''} onChange={(e) => update('meetingUrl', e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Meeting Password" value={form.meetingPassword ?? ''} onChange={(e) => update('meetingPassword', e.target.value)} />
              <Input label="Meeting ID" value={form.meetingId ?? ''} onChange={(e) => update('meetingId', e.target.value)} />
            </div>
            <Input label="Batch ID" value={form.batchId ?? ''} onChange={(e) => update('batchId', e.target.value)} required />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Start Time" type="datetime-local" value={form.startTime ?? ''} onChange={(e) => update('startTime', e.target.value)} required />
              <Input label="End Time" type="datetime-local" value={form.endTime ?? ''} onChange={(e) => update('endTime', e.target.value)} required />
            </div>
            <Input label="Timezone" value={form.timezone ?? 'UTC'} onChange={(e) => update('timezone', e.target.value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Recurring" options={recurringOptions} value={form.recurring ?? 'none'} onChange={(e) => update('recurring', e.target.value as RecurringPattern)} />
              <Input label="Max Participants" type="number" value={form.maxParticipants ?? ''} onChange={(e) => update('maxParticipants', e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={form.waitingRoom} onChange={(e) => update('waitingRoom', e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" /> Waiting Room</label>
              <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={form.allowRecording} onChange={(e) => update('allowRecording', e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" /> Allow Recording</label>
              <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={form.autoRecording} onChange={(e) => update('autoRecording', e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" /> Auto Recording</label>
            </div>
            <Input label="Thumbnail URL" value={form.thumbnailUrl ?? ''} onChange={(e) => update('thumbnailUrl', e.target.value)} />
            {error && <p className="text-sm text-error-600">{error}</p>}
            <div className="flex items-center gap-2">
              <Button type="submit" loading={saving}><Save className="h-4 w-4" /> {isEdit ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}