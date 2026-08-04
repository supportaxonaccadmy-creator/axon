import { memo } from 'react';
import { Smartphone, Tablet, Monitor, Trash2 } from 'lucide-react';
import type { DeviceSession } from '@/services/security';
import { cn } from '@/utils/cn';

interface DeviceCardProps { device: DeviceSession; onRevoke?: (id: string) => void; isCurrent?: boolean; }

function DeviceCardComponent({ device, onRevoke, isCurrent }: DeviceCardProps) {
  const Icon = device.deviceType === 'mobile' ? Smartphone : device.deviceType === 'tablet' ? Tablet : Monitor;
  const lastActive = new Date(device.lastActiveAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50"><Icon className="h-5 w-5 text-primary-600" /></div><div><p className="text-sm font-medium text-neutral-900">{device.deviceName ?? 'Unknown Device'}{isCurrent && <span className={cn('ml-2 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700')}>Current</span>}</p><p className="text-xs text-neutral-400">{device.browser} | {device.os} | Last active: {lastActive}</p></div></div>
      {onRevoke && !isCurrent && (<button onClick={() => onRevoke(device.id)} className="rounded-lg p-2 text-neutral-400 hover:bg-error-50 hover:text-error-600" aria-label="Revoke device"><Trash2 className="h-4 w-4" /></button>)}
    </div>
  );
}
export const DeviceCard = memo(DeviceCardComponent);
