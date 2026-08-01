import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { AnnouncementCard } from '@/components/notification';
import { announcementService } from '@/services/notification';
import type { Announcement, AnnouncementStatus } from '@/services/notification';
import { useCurrentUser } from '@/hooks/useProfile';
import type { Option } from '@/types/common';

export function AnnouncementManagementPage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '', body: '', isPinned: false, isGlobal: true, batchId: '',
    status: 'draft' as AnnouncementStatus, scheduledFor: '', expiresAt: '',
  });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data } = await announcementService.getAll();
    setAnnouncements(data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) return;

    const input = {
      title: formData.title.trim(),
      body: formData.body.trim(),
      isPinned: formData.isPinned,
      isGlobal: formData.isGlobal,
      batchId: formData.isGlobal ? null : (formData.batchId || null),
      status: formData.status,
      scheduledFor: formData.scheduledFor || null,
      expiresAt: formData.expiresAt || null,
    };

    if (editing) {
      await announcementService.update(editing.id, input);
    } else {
      await announcementService.create(adminId, input);
    }

    setFormData({ title: '', body: '', isPinned: false, isGlobal: true, batchId: '', status: 'draft', scheduledFor: '', expiresAt: '' });
    setEditing(null);
    setShowForm(false);
    void fetchAnnouncements();
  };

  const handleEdit = (a: Announcement) => {
    setEditing(a);
    setFormData({
      title: a.title, body: a.body, isPinned: a.isPinned, isGlobal: a.isGlobal,
      batchId: a.batchId ?? '', status: a.status,
      scheduledFor: a.scheduledFor ?? '', expiresAt: a.expiresAt ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await announcementService.delete(id);
    void fetchAnnouncements();
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    await announcementService.togglePin(id, isPinned);
    void fetchAnnouncements();
  };

  const handlePublish = async (id: string) => {
    await announcementService.publish(id);
    void fetchAnnouncements();
  };

  const handleArchive = async (id: string) => {
    await announcementService.archive(id);
    void fetchAnnouncements();
  };

  const statusOptions: Option[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Announcements</h1>
          <p className="mt-1 text-sm text-neutral-500">Create and manage announcements for students</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormData({ title: '', body: '', isPinned: false, isGlobal: true, batchId: '', status: 'draft', scheduledFor: '', expiresAt: '' }); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Announcement' : 'Create Announcement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Title" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="Announcement title..." required />
              <Textarea label="Body" value={formData.body} onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))} placeholder="Announcement content..." rows={4} required />

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={formData.isPinned} onChange={(e) => setFormData((prev) => ({ ...prev, isPinned: e.target.checked }))} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                  Pin to top
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={formData.isGlobal} onChange={(e) => setFormData((prev) => ({ ...prev, isGlobal: e.target.checked }))} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                  Global (all students)
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select label="Status" options={statusOptions} value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as AnnouncementStatus }))} />
                <Input label="Schedule For (optional)" type="datetime-local" value={formData.scheduledFor} onChange={(e) => setFormData((prev) => ({ ...prev, scheduledFor: e.target.value }))} />
                <Input label="Expires At (optional)" type="datetime-local" value={formData.expiresAt} onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))} />
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
      ) : announcements.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Megaphone className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No announcements yet</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              isAdmin
              onPin={handlePin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
