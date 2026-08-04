import { memo, useState, useEffect, useCallback } from 'react';
import { MonitorSmartphone, Trash2, RefreshCw } from 'lucide-react';
import { useDeviceTracking } from '@/hooks/useDeviceTracking';
import { DeviceCard } from './DeviceCard';

function ActiveSessionsCardComponent() {
  const { devices, loading, revokeDevice, revokeAllDevices, reload } = useDeviceTracking();
  const [revoking, setRevoking] = useState(false);
  const currentDeviceId = typeof localStorage !== 'undefined' ? localStorage.getItem('lms_device_id') : null;
  useEffect(() => { void reload(); }, [reload]);
  const handleRevoke = useCallback(async (id: string) => { setRevoking(true); await revokeDevice(id); setRevoking(false); }, [revokeDevice]);
  const handleRevokeAll = useCallback(async () => { setRevoking(true); await revokeAllDevices(); setRevoking(false); }, [revokeAllDevices]);
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><MonitorSmartphone className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Active Sessions</h3></div>{devices.length > 1 && (<button onClick={handleRevokeAll} disabled={revoking} className="flex items-center gap-1.5 rounded-lg border border-error-200 px-3 py-1.5 text-xs font-medium text-error-600 hover:bg-error-50 disabled:opacity-50">{revoking ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Revoke All</button>)}</div>
      {loading ? (<p className="text-sm text-neutral-400">Loading sessions...</p>) : devices.length === 0 ? (<p className="text-sm text-neutral-400">No active sessions found.</p>) : (<div className="space-y-3">{devices.map((device) => (<DeviceCard key={device.id} device={device} onRevoke={handleRevoke} isCurrent={device.deviceId === currentDeviceId} />))}</div>)}
    </div>
  );
}
export const ActiveSessionsCard = memo(ActiveSessionsCardComponent);
