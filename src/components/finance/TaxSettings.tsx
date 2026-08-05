import { memo, useState, useEffect, useCallback } from 'react';
import { Percent, Save } from 'lucide-react';
import { taxService } from '@/services/finance';
import type { TaxSettings } from '@/services/finance';

function TaxSettingsComponent() {
  const [settings, setSettings] = useState<TaxSettings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void taxService.getTaxSettings().then(setSettings); }, []);
  const handleSave = useCallback(async () => { if (!settings) return; setSaving(true); await taxService.updateTaxSettings(settings.id, settings); setSaving(false); }, [settings]);
  const update = useCallback((field: keyof TaxSettings, value: string | number | boolean) => { setSettings((prev) => prev ? { ...prev, [field]: value } : prev); }, []);
  if (!settings) return <div className="p-4 text-sm text-neutral-400">Loading tax settings...</div>;
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Percent className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Tax Settings (GST)</h3></div><button onClick={handleSave} disabled={saving} className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"><Save className="h-3.5 w-3.5" /> Save</button></div><div className="space-y-4"><div><label className="text-xs text-neutral-500">Tax Name</label><input value={settings.taxName} onChange={(e) => update('taxName', e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" /></div><div className="grid grid-cols-3 gap-3"><div><label className="text-xs text-neutral-500">CGST (%)</label><input type="number" step="0.01" value={settings.cgstRate} onChange={(e) => update('cgstRate', Number(e.target.value))} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" /></div><div><label className="text-xs text-neutral-500">SGST (%)</label><input type="number" step="0.01" value={settings.sgstRate} onChange={(e) => update('sgstRate', Number(e.target.value))} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" /></div><div><label className="text-xs text-neutral-500">IGST (%)</label><input type="number" step="0.01" value={settings.igstRate} onChange={(e) => update('igstRate', Number(e.target.value))} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" /></div></div><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={settings.isInclusive} onChange={(e) => update('isInclusive', e.target.checked)} /> Tax is inclusive (price includes tax)</label></div></div>);
}
export const TaxSettingsCard = memo(TaxSettingsComponent);
