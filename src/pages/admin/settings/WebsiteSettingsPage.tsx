import { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard } from '@/components/admin/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { WebsiteSettings } from '@/types/settings';

const DEFAULTS: WebsiteSettings = {
  siteName: 'Axon LMS', tagline: 'Enterprise Nursing Education Platform', description: 'Comprehensive learning management system for nursing education.',
  logoUrl: '', faviconUrl: '', primaryColor: '#3b82f6', secondaryColor: '#10b981',
  contactPhone: '', contactEmail: '', contactAddress: '',
  socialFacebook: '', socialInstagram: '', socialYouTube: '', socialTelegram: '',
  footerCopyright: '© 2026 Axon LMS. All rights reserved.', footerLinks: '',
};

export function WebsiteSettingsPage() {
  const [form, setForm] = useState<WebsiteSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((field: keyof WebsiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    localStorage.setItem('website_settings', JSON.stringify(form));
    setSaving(false);
  }, [form]);

  return (
    <SettingsLayout title="Website Settings" description="Configure your website's appearance and contact information">
      <SettingCard title="General" description="Basic website information">
        <div className="space-y-4">
          <Input label="Website Name" value={form.siteName} onChange={(e) => handleChange('siteName', e.target.value)} />
          <Input label="Tagline" value={form.tagline} onChange={(e) => handleChange('tagline', e.target.value)} />
          <Textarea label="Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => handleChange('logoUrl', e.target.value)} placeholder="https://..." />
          <Input label="Favicon URL" value={form.faviconUrl} onChange={(e) => handleChange('faviconUrl', e.target.value)} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium text-neutral-700">Primary Color</label><div className="flex items-center gap-2"><input type="color" value={form.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="h-10 w-16 rounded border border-neutral-200" /><Input value={form.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} /></div></div>
            <div><label className="mb-1 block text-sm font-medium text-neutral-700">Secondary Color</label><div className="flex items-center gap-2"><input type="color" value={form.secondaryColor} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="h-10 w-16 rounded border border-neutral-200" /><Input value={form.secondaryColor} onChange={(e) => handleChange('secondaryColor', e.target.value)} /></div></div>
          </div>
        </div>
      </SettingCard>
      <SettingCard title="Contact Information" description="How users can reach you">
        <div className="space-y-4">
          <Input label="Phone" value={form.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} placeholder="+91 98765 43210" />
          <Input label="Email" type="email" value={form.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} placeholder="contact@example.com" />
          <Textarea label="Address" value={form.contactAddress} onChange={(e) => handleChange('contactAddress', e.target.value)} rows={2} />
        </div>
      </SettingCard>
      <SettingCard title="Social Links" description="Your social media profiles">
        <div className="space-y-4">
          <Input label="Facebook" value={form.socialFacebook} onChange={(e) => handleChange('socialFacebook', e.target.value)} placeholder="https://facebook.com/..." />
          <Input label="Instagram" value={form.socialInstagram} onChange={(e) => handleChange('socialInstagram', e.target.value)} placeholder="https://instagram.com/..." />
          <Input label="YouTube" value={form.socialYouTube} onChange={(e) => handleChange('socialYouTube', e.target.value)} placeholder="https://youtube.com/..." />
          <Input label="Telegram" value={form.socialTelegram} onChange={(e) => handleChange('socialTelegram', e.target.value)} placeholder="https://t.me/..." />
        </div>
      </SettingCard>
      <SettingCard title="Footer" description="Footer content and links">
        <div className="space-y-4">
          <Input label="Copyright Text" value={form.footerCopyright} onChange={(e) => handleChange('footerCopyright', e.target.value)} />
          <Textarea label="Footer Links (JSON)" value={form.footerLinks} onChange={(e) => handleChange('footerLinks', e.target.value)} rows={3} placeholder='[{"label":"Privacy","href":"/privacy"}]' />
        </div>
      </SettingCard>
      <div className="flex justify-end"><Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" />Save Settings</Button></div>
    </SettingsLayout>
  );
}
