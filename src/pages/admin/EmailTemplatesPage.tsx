import { useState, useEffect, useCallback } from 'react';
import { Mail, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { EmailTemplateCard } from '@/components/notification';
import { messageTemplateService } from '@/services/notification';
import type { MessageTemplate, TemplateType } from '@/services/notification';
import { useCurrentUser } from '@/hooks/useProfile';
import type { Option } from '@/types/common';

export function EmailTemplatesPage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'custom' as TemplateType, subject: '', body: '' });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data } = await messageTemplateService.getAll();
    setTemplates(data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchTemplates(); }, [fetchTemplates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) return;

    if (editing) {
      await messageTemplateService.update(editing.id, formData);
    } else {
      await messageTemplateService.create(adminId, formData);
    }

    setFormData({ name: '', type: 'custom', subject: '', body: '' });
    setEditing(null);
    setShowForm(false);
    void fetchTemplates();
  };

  const handleEdit = (t: MessageTemplate) => {
    setEditing(t);
    setFormData({ name: t.name, type: t.type, subject: t.subject, body: t.body });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await messageTemplateService.delete(id);
    void fetchTemplates();
  };

  const handleDuplicate = async (t: MessageTemplate) => {
    await messageTemplateService.create(adminId, {
      name: `${t.name} (Copy)`,
      type: t.type,
      subject: t.subject,
      body: t.body,
      variables: t.variables,
    });
    void fetchTemplates();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await messageTemplateService.toggleActive(id, isActive);
    void fetchTemplates();
  };

  const handleSeedDefaults = async () => {
    const defaults = messageTemplateService.getDefaultTemplates();
    for (const tmpl of defaults) {
      await messageTemplateService.create(adminId, tmpl);
    }
    void fetchTemplates();
  };

  const typeOptions: Option[] = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'purchase_success', label: 'Purchase Success' },
    { value: 'enrollment', label: 'Enrollment' },
    { value: 'password_reset', label: 'Password Reset' },
    { value: 'payment_failed', label: 'Payment Failed' },
    { value: 'live_reminder', label: 'Live Reminder' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Email Templates</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage reusable email templates with variables</p>
        </div>
        <div className="flex items-center gap-2">
          {templates.length === 0 && (
            <Button variant="outline" onClick={handleSeedDefaults}>
              <FileText className="h-4 w-4" /> Seed Defaults
            </Button>
          )}
          <Button onClick={() => { setEditing(null); setFormData({ name: '', type: 'custom', subject: '', body: '' }); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> New Template
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit Template' : 'Create Template'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Template name..." required />
                <Select label="Type" options={typeOptions} value={formData.type} onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as TemplateType }))} />
              </div>
              <Input label="Subject" value={formData.subject} onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))} placeholder="Email subject..." required />
              <Textarea label="Body" value={formData.body} onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))} placeholder="Email body... Use {{variable}} for placeholders." rows={6} required />
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
      ) : templates.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Mail className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No templates yet. Click "Seed Defaults" to create standard templates.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <EmailTemplateCard
              key={t.id}
              template={t}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
