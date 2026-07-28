import { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard } from '@/components/admin/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { Option } from '@/types/common';
import type { SeoSettings } from '@/types/settings';

const ROBOTS_OPTIONS: Option[] = [
  { label: 'Index, Follow', value: 'index, follow' },
  { label: 'No Index, Follow', value: 'noindex, follow' },
  { label: 'Index, No Follow', value: 'index, nofollow' },
  { label: 'No Index, No Follow', value: 'noindex, nofollow' },
];

const TWITTER_OPTIONS: Option[] = [
  { label: 'Summary', value: 'summary' },
  { label: 'Summary with Large Image', value: 'summary_large_image' },
  { label: 'Player', value: 'player' },
  { label: 'App', value: 'app' },
];

export function SeoSettingsPage() {
  const [form, setForm] = useState<SeoSettings>({
    homepageTitle: 'Axon LMS - Enterprise Nursing Education', homepageDescription: 'Comprehensive nursing education platform with courses, MCQs, and live classes.',
    keywords: 'nursing, lms, education, courses, mcq', ogTitle: 'Axon LMS', ogDescription: 'Enterprise Nursing Education Platform',
    ogImage: '', twitterCard: 'summary_large_image', robots: 'index, follow', canonicalUrl: '', sitemapUrl: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((field: keyof SeoSettings, value: string) => { setForm((prev) => ({ ...prev, [field]: value })); }, []);
  const handleSave = useCallback(async () => { setSaving(true); localStorage.setItem('seo_settings', JSON.stringify(form)); setSaving(false); }, [form]);

  return (
    <SettingsLayout title="SEO Settings" description="Optimize your site for search engines">
      <SettingCard title="Homepage SEO" description="Meta tags for your homepage">
        <div className="space-y-4">
          <Input label="Homepage Title" value={form.homepageTitle} onChange={(e) => handleChange('homepageTitle', e.target.value)} />
          <Textarea label="Homepage Description" value={form.homepageDescription} onChange={(e) => handleChange('homepageDescription', e.target.value)} rows={2} />
          <Input label="Keywords (comma separated)" value={form.keywords} onChange={(e) => handleChange('keywords', e.target.value)} />
        </div>
      </SettingCard>
      <SettingCard title="Open Graph" description="Social media sharing metadata">
        <div className="space-y-4">
          <Input label="OG Title" value={form.ogTitle} onChange={(e) => handleChange('ogTitle', e.target.value)} />
          <Textarea label="OG Description" value={form.ogDescription} onChange={(e) => handleChange('ogDescription', e.target.value)} rows={2} />
          <Input label="OG Image URL" value={form.ogImage} onChange={(e) => handleChange('ogImage', e.target.value)} placeholder="https://..." />
        </div>
      </SettingCard>
      <SettingCard title="Twitter & Robots" description="Twitter card and crawler directives">
        <div className="space-y-4">
          <Select label="Twitter Card Type" options={TWITTER_OPTIONS} value={form.twitterCard} onChange={(e) => handleChange('twitterCard', e.target.value)} />
          <Select label="Robots Directive" options={ROBOTS_OPTIONS} value={form.robots} onChange={(e) => handleChange('robots', e.target.value)} />
          <Input label="Canonical URL" value={form.canonicalUrl} onChange={(e) => handleChange('canonicalUrl', e.target.value)} placeholder="https://..." />
          <Input label="Sitemap URL" value={form.sitemapUrl} onChange={(e) => handleChange('sitemapUrl', e.target.value)} placeholder="https://.../sitemap.xml" />
        </div>
      </SettingCard>
      <div className="flex justify-end"><Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" />Save Settings</Button></div>
    </SettingsLayout>
  );
}
