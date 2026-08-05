import { memo, useState, useEffect, useCallback } from 'react';
import { CreditCard, Save } from 'lucide-react';
import { financeSettingsService } from '@/services/finance';
import type { FinanceSettings, GatewayType } from '@/services/finance';

const GATEWAYS: { key: GatewayType; label: string }[] = [
  { key: 'razorpay', label: 'Razorpay' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'cashfree', label: 'Cashfree' },
  { key: 'phonepe', label: 'PhonePe' },
  { key: 'manual', label: 'Manual Payment' },
];

function GatewayConfigComponent() {
  const [settings, setSettings] = useState<FinanceSettings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void financeSettingsService.getSettings().then(setSettings); }, []);
  const handleSave = useCallback(async () => { if (!settings) return; setSaving(true); await financeSettingsService.updateSettings(settings.id, settings); setSaving(false); }, [settings]);
  const update = useCallback((field: keyof FinanceSettings, value: string | boolean | number) => { setSettings((prev) => prev ? { ...prev, [field]: value } : prev); }, []);
  if (!settings) return <div className="p-4 text-sm text-neutral-400">Loading settings...</div>;
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><CreditCard className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Gateway Configuration</h3></div><button onClick={handleSave} disabled={saving} className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"><Save className="h-3.5 w-3.5" /> Save</button></div><div className="space-y-4"><div><label className="text-xs text-neutral-500">Primary Gateway</label><select value={settings.primaryGateway} onChange={(e) => update('primaryGateway', e.target.value as GatewayType)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm">{GATEWAYS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-neutral-500">Default Currency</label><input value={settings.defaultCurrency} onChange={(e) => update('defaultCurrency', e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" /></div><div><label className="text-xs text-neutral-500">Invoice Prefix</label><input value={settings.invoicePrefix} onChange={(e) => update('invoicePrefix', e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" /></div></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-neutral-500">Success URL</label><input value={settings.successUrl ?? ''} onChange={(e) => update('successUrl', e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" placeholder="/student/payment/success" /></div><div><label className="text-xs text-neutral-500">Cancel URL</label><input value={settings.cancelUrl ?? ''} onChange={(e) => update('cancelUrl', e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm" placeholder="/student/payment/failure" /></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={settings.enableWallet} onChange={(e) => update('enableWallet', e.target.checked)} /> Wallet</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={settings.enableCoupons} onChange={(e) => update('enableCoupons', e.target.checked)} /> Coupons</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={settings.enableRefunds} onChange={(e) => update('enableRefunds', e.target.checked)} /> Refunds</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={settings.autoEnrollOnPayment} onChange={(e) => update('autoEnrollOnPayment', e.target.checked)} /> Auto-Enroll</label></div></div></div>);
}
export const GatewayConfig = memo(GatewayConfigComponent);
