import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CertificateTemplateEditor } from '@/components/gamification';
import { certificateTemplateService } from '@/services/gamification';
import { useCurrentUser } from '@/hooks/useProfile';
import { formatRelativeTime } from '@/services/gamification';
import type { CertificateTemplate, CreateTemplateInput } from '@/services/gamification';

export function CertificateTemplatePage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CertificateTemplate | null>(null);
  const [form, setForm] = useState<Partial<CreateTemplateInput>>({});

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data } = await certificateTemplateService.getAll();
    setTemplates(data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchTemplates(); }, [fetchTemplates]);

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    if (editing) {
      await certificateTemplateService.update(editing.id, form);
    } else {
      await certificateTemplateService.create(adminId, form as CreateTemplateInput);
    }
    setForm({});
    setEditing(null);
    setShowForm(false);
    void fetchTemplates();
  };

  const handleEdit = (t: CertificateTemplate) => {
    setEditing(t);
    setForm({ name: t.name, description: t.description, backgroundUrl: t.backgroundUrl, logoUrl: t.logoUrl, signatureUrl: t.signatureUrl, stampUrl: t.stampUrl, templateConfig: t.templateConfig });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await certificateTemplateService.delete(id);
    void fetchTemplates();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await certificateTemplateService.toggleActive(id, isActive);
    void fetchTemplates();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Certificate Templates</h1>
          <p className="mt-1 text-sm text-neutral-500">Design and manage certificate templates</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({}); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit Template' : 'Create Template'}</CardTitle></CardHeader>
          <CardContent>
            <CertificateTemplateEditor template={form} onChange={setForm} onSave={handleSave} />
            <Button type="button" variant="outline" className="mt-3" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-neutral-500">Loading...</div>
      ) : templates.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><FileText className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No templates yet</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id} hover>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">{t.name}</h3>
                    {t.description && <p className="text-xs text-neutral-500">{t.description}</p>}
                    <p className="mt-1 text-[11px] text-neutral-400">{formatRelativeTime(t.createdAt)}</p>
                  </div>
                  <Badge variant={t.isActive ? 'success' : 'default'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
                  <button onClick={() => handleToggle(t.id, !t.isActive)} className="rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">{t.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => handleEdit(t)} className="rounded-md p-1 text-primary-600 hover:bg-primary-50"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(t.id)} className="rounded-md p-1 text-error-500 hover:bg-error-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
