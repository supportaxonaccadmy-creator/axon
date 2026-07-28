import { useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard, ToggleSetting } from '@/components/admin/settings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PAYMENT_GATEWAYS } from '@/constants/settings';
import type { PaymentGatewayConfig } from '@/types/settings';

export function PaymentSettingsPage() {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(
    PAYMENT_GATEWAYS.map((g) => ({ ...g, enabled: g.key === 'razorpay', apiKey: '', secretKey: '', webhookSecret: '', testMode: true }))
  );
  const [saving, setSaving] = useState(false);

  const updateGateway = useCallback((key: string, field: keyof PaymentGatewayConfig, value: string | boolean) => {
    setGateways((prev) => prev.map((g) => (g.key === key ? { ...g, [field]: value } : g)));
  }, []);

  const handleSave = useCallback(async () => { setSaving(true); localStorage.setItem('payment_settings', JSON.stringify(gateways)); setSaving(false); }, [gateways]);

  return (
    <SettingsLayout title="Payment Settings" description="Configure payment gateways (UI only — no live integration)">
      {gateways.map((gw) => (
        <SettingCard key={gw.key} title={gw.label} description={`${gw.label} payment gateway configuration`}>
          <div className="space-y-4">
            <ToggleSetting label="Enable Gateway" description={`Enable ${gw.label} for accepting payments`} checked={gw.enabled} onChange={(v) => updateGateway(gw.key, 'enabled', v)} />
            {gw.enabled && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="API Key" value={gw.apiKey} onChange={(e) => updateGateway(gw.key, 'apiKey', e.target.value)} placeholder="Enter API key" />
                  <Input label="Secret Key" type="password" value={gw.secretKey} onChange={(e) => updateGateway(gw.key, 'secretKey', e.target.value)} placeholder="Enter secret key" />
                </div>
                <Input label="Webhook Secret" value={gw.webhookSecret} onChange={(e) => updateGateway(gw.key, 'webhookSecret', e.target.value)} placeholder="Webhook secret" />
                <ToggleSetting label="Test Mode" description="Use test/sandbox environment" checked={gw.testMode} onChange={(v) => updateGateway(gw.key, 'testMode', v)} />
              </>
            )}
          </div>
        </SettingCard>
      ))}
      <div className="flex justify-end"><Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" />Save Settings</Button></div>
    </SettingsLayout>
  );
}
