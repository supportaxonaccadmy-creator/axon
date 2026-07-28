import { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard, ToggleSetting } from '@/components/admin/settings';
import { Button } from '@/components/ui/Button';
import type { NotificationSettings } from '@/types/settings';

export function NotificationSettingsPage() {
  const [form, setForm] = useState<NotificationSettings>({
    emailNotifications: true, smsNotifications: false, pushNotifications: true, announcementNotifications: true,
    studentRegistration: true, purchaseSuccess: true, enrollmentSuccess: true, passwordReset: true, coursePublish: false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((field: keyof NotificationSettings, value: boolean) => { setForm((prev) => ({ ...prev, [field]: value })); }, []);
  const handleSave = useCallback(async () => { setSaving(true); localStorage.setItem('notification_settings', JSON.stringify(form)); setSaving(false); }, [form]);

  return (
    <SettingsLayout title="Notification Settings" description="Configure system notifications">
      <SettingCard title="Channels" description="Enable notification channels">
        <ToggleSetting label="Email Notifications" description="Send notifications via email" checked={form.emailNotifications} onChange={(v) => handleChange('emailNotifications', v)} />
        <ToggleSetting label="SMS Notifications" description="Send notifications via SMS" checked={form.smsNotifications} onChange={(v) => handleChange('smsNotifications', v)} />
        <ToggleSetting label="Push Notifications" description="Browser push notifications" checked={form.pushNotifications} onChange={(v) => handleChange('pushNotifications', v)} />
        <ToggleSetting label="Announcement Notifications" description="Notify on new announcements" checked={form.announcementNotifications} onChange={(v) => handleChange('announcementNotifications', v)} />
      </SettingCard>
      <SettingCard title="Event Notifications" description="Trigger notifications on specific events">
        <ToggleSetting label="Student Registration" description="Notify on new student registration" checked={form.studentRegistration} onChange={(v) => handleChange('studentRegistration', v)} />
        <ToggleSetting label="Purchase Success" description="Notify on successful purchase" checked={form.purchaseSuccess} onChange={(v) => handleChange('purchaseSuccess', v)} />
        <ToggleSetting label="Enrollment Success" description="Notify on new enrollment" checked={form.enrollmentSuccess} onChange={(v) => handleChange('enrollmentSuccess', v)} />
        <ToggleSetting label="Password Reset" description="Notify on password reset request" checked={form.passwordReset} onChange={(v) => handleChange('passwordReset', v)} />
        <ToggleSetting label="Course Publish" description="Notify when a course is published" checked={form.coursePublish} onChange={(v) => handleChange('coursePublish', v)} />
      </SettingCard>
      <div className="flex justify-end"><Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" />Save Settings</Button></div>
    </SettingsLayout>
  );
}
