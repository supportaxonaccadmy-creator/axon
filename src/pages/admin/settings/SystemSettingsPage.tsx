import { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard, ToggleSetting } from '@/components/admin/settings';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TIMEZONES, LANGUAGES, DATE_FORMATS, CURRENCIES } from '@/constants/settings';
import type { Option } from '@/types/common';
import type { SystemSettings } from '@/types/settings';

const toOptions = (arr: string[]): Option[] => arr.map((v) => ({ label: v, value: v }));

export function SystemSettingsPage() {
  const [form, setForm] = useState<SystemSettings>({
    timezone: 'Asia/Kolkata', language: 'English', dateFormat: 'DD/MM/YYYY', currency: 'INR',
    maintenanceMode: false, debugMode: false, registrationEnabled: true, studentApprovalRequired: false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((field: keyof SystemSettings, value: string | boolean) => { setForm((prev) => ({ ...prev, [field]: value as never })); }, []);
  const handleSave = useCallback(async () => { setSaving(true); localStorage.setItem('system_settings', JSON.stringify(form)); setSaving(false); }, [form]);

  return (
    <SettingsLayout title="System Settings" description="General system configuration">
      <SettingCard title="Localization" description="Regional and language settings">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Timezone" options={toOptions(TIMEZONES)} value={form.timezone} onChange={(e) => handleChange('timezone', e.target.value)} />
          <Select label="Language" options={toOptions(LANGUAGES)} value={form.language} onChange={(e) => handleChange('language', e.target.value)} />
          <Select label="Date Format" options={toOptions(DATE_FORMATS)} value={form.dateFormat} onChange={(e) => handleChange('dateFormat', e.target.value)} />
          <Select label="Currency" options={toOptions(CURRENCIES)} value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} />
        </div>
      </SettingCard>
      <SettingCard title="System Modes" description="Control system-wide behavior">
        <ToggleSetting label="Maintenance Mode" description="Take the site offline for maintenance" checked={form.maintenanceMode} onChange={(v) => handleChange('maintenanceMode', v)} />
        <ToggleSetting label="Debug Mode" description="Show detailed error messages" checked={form.debugMode} onChange={(v) => handleChange('debugMode', v)} />
      </SettingCard>
      <SettingCard title="Registration" description="Control user registration">
        <ToggleSetting label="Enable Registration" description="Allow new user sign-ups" checked={form.registrationEnabled} onChange={(v) => handleChange('registrationEnabled', v)} />
        <ToggleSetting label="Student Approval Required" description="Admin must approve new student accounts" checked={form.studentApprovalRequired} onChange={(v) => handleChange('studentApprovalRequired', v)} />
      </SettingCard>
      <div className="flex justify-end"><Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" />Save Settings</Button></div>
    </SettingsLayout>
  );
}
