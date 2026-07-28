import { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard, ToggleSetting } from '@/components/admin/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { SecuritySettings } from '@/types/settings';

export function SecuritySettingsPage() {
  const [form, setForm] = useState<SecuritySettings>({
    minPasswordLength: 8, requireNumbers: true, requireSymbols: true, requireUppercase: true,
    sessionTimeout: 30, maxLoginAttempts: 5, twoFactorAuth: false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((field: keyof SecuritySettings, value: number | boolean) => { setForm((prev) => ({ ...prev, [field]: value as never })); }, []);
  const handleSave = useCallback(async () => { setSaving(true); localStorage.setItem('security_settings', JSON.stringify(form)); setSaving(false); }, [form]);

  return (
    <SettingsLayout title="Security Settings" description="Configure password policies and security">
      <SettingCard title="Password Policy" description="Rules for user passwords">
        <div className="space-y-4">
          <Input label="Minimum Password Length" type="number" value={form.minPasswordLength} onChange={(e) => handleChange('minPasswordLength', Number(e.target.value))} />
          <ToggleSetting label="Require Numbers" description="Password must contain at least one number" checked={form.requireNumbers} onChange={(v) => handleChange('requireNumbers', v)} />
          <ToggleSetting label="Require Symbols" description="Password must contain at least one special character" checked={form.requireSymbols} onChange={(v) => handleChange('requireSymbols', v)} />
          <ToggleSetting label="Require Uppercase" description="Password must contain at least one uppercase letter" checked={form.requireUppercase} onChange={(v) => handleChange('requireUppercase', v)} />
        </div>
      </SettingCard>
      <SettingCard title="Session & Login" description="Session and login attempt limits">
        <div className="space-y-4">
          <Input label="Session Timeout (minutes)" type="number" value={form.sessionTimeout} onChange={(e) => handleChange('sessionTimeout', Number(e.target.value))} />
          <Input label="Max Login Attempts" type="number" value={form.maxLoginAttempts} onChange={(e) => handleChange('maxLoginAttempts', Number(e.target.value))} />
        </div>
      </SettingCard>
      <SettingCard title="Two-Factor Authentication" description="Additional login security">
        <ToggleSetting label="Enable 2FA" description="Require two-factor authentication for admin accounts" checked={form.twoFactorAuth} onChange={(v) => handleChange('twoFactorAuth', v)} />
      </SettingCard>
      <div className="flex justify-end"><Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" />Save Settings</Button></div>
    </SettingsLayout>
  );
}
