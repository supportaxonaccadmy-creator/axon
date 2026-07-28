import { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard } from '@/components/admin/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { StorageSettings } from '@/types/settings';

export function StorageSettingsPage() {
  const [form, setForm] = useState<StorageSettings>({
    bucketName: 'lms-storage', maxUploadSize: '50', allowedExtensions: 'jpg,jpeg,png,webp,mp4,pdf,docx',
    imageMaxWidth: '1920', imageMaxHeight: '1080', videoMaxSize: '500', pdfMaxSize: '50', attachmentMaxSize: '25',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((field: keyof StorageSettings, value: string) => { setForm((prev) => ({ ...prev, [field]: value })); }, []);
  const handleSave = useCallback(async () => { setSaving(true); localStorage.setItem('storage_settings', JSON.stringify(form)); setSaving(false); }, [form]);

  return (
    <SettingsLayout title="Storage Settings" description="Configure file upload limits and storage">
      <SettingCard title="General Storage" description="Bucket and upload limits">
        <div className="space-y-4">
          <Input label="Storage Bucket Name" value={form.bucketName} onChange={(e) => handleChange('bucketName', e.target.value)} />
          <Input label="Max Upload Size (MB)" type="number" value={form.maxUploadSize} onChange={(e) => handleChange('maxUploadSize', e.target.value)} />
          <Textarea label="Allowed Extensions (comma separated)" value={form.allowedExtensions} onChange={(e) => handleChange('allowedExtensions', e.target.value)} rows={2} />
        </div>
      </SettingCard>
      <SettingCard title="Image Settings" description="Image upload constraints">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Max Width (px)" type="number" value={form.imageMaxWidth} onChange={(e) => handleChange('imageMaxWidth', e.target.value)} />
          <Input label="Max Height (px)" type="number" value={form.imageMaxHeight} onChange={(e) => handleChange('imageMaxHeight', e.target.value)} />
        </div>
      </SettingCard>
      <SettingCard title="File Type Limits" description="Size limits per file type (MB)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Video Max Size" type="number" value={form.videoMaxSize} onChange={(e) => handleChange('videoMaxSize', e.target.value)} />
          <Input label="PDF Max Size" type="number" value={form.pdfMaxSize} onChange={(e) => handleChange('pdfMaxSize', e.target.value)} />
          <Input label="Attachment Max Size" type="number" value={form.attachmentMaxSize} onChange={(e) => handleChange('attachmentMaxSize', e.target.value)} />
        </div>
      </SettingCard>
      <div className="flex justify-end"><Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" />Save Settings</Button></div>
    </SettingsLayout>
  );
}
