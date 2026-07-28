import { useState, useCallback } from 'react';
import { Save, Send } from 'lucide-react';
import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard } from '@/components/admin/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import type { Option } from '@/types/common';
import type { EmailSettings } from '@/types/settings';

const ENCRYPTION_OPTIONS: Option[] = [{ label: 'None', value: 'none' }, { label: 'SSL', value: 'ssl' }, { label: 'TLS', value: 'tls' }];

export function EmailSettingsPage() {
  const [form, setForm] = useState<EmailSettings>({ smtpHost: '', smtpPort: '587', username: '', password: '', encryption: 'tls', senderName: 'Axon LMS', senderEmail: 'noreply@example.com' });
  const [saving, setSaving] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleChange = useCallback((field: keyof EmailSettings, value: string) => { setForm((prev) => ({ ...prev, [field]: value as never })); }, []);
  const handleSave = useCallback(async () => { setSaving(true); localStorage.setItem('email_settings', JSON.stringify(form)); setSaving(false); }, [form]);
  const handleTest = useCallback(() => { setTestSent(true); setTimeout(() => setTestSent(false), 3000); }, []);

  return (
    <SettingsLayout title="Email Settings" description="Configure SMTP for sending emails">
      {testSent && <Alert variant="success" title="Test email sent">A test email has been sent to the configured sender address.</Alert>}
      <SettingCard title="SMTP Configuration" description="Outgoing mail server settings">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="SMTP Host" value={form.smtpHost} onChange={(e) => handleChange('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
            <Input label="SMTP Port" value={form.smtpPort} onChange={(e) => handleChange('smtpPort', e.target.value)} placeholder="587" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Username" value={form.username} onChange={(e) => handleChange('username', e.target.value)} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
          </div>
          <Select label="Encryption" options={ENCRYPTION_OPTIONS} value={form.encryption} onChange={(e) => handleChange('encryption', e.target.value)} />
        </div>
      </SettingCard>
      <SettingCard title="Sender Information" description="Default sender details">
        <div className="space-y-4">
          <Input label="Sender Name" value={form.senderName} onChange={(e) => handleChange('senderName', e.target.value)} />
          <Input label="Sender Email" type="email" value={form.senderEmail} onChange={(e) => handleChange('senderEmail', e.target.value)} />
        </div>
      </SettingCard>
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleTest}><Send className="h-4 w-4" />Send Test Email</Button>
        <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" />Save Settings</Button>
      </div>
    </SettingsLayout>
  );
}
