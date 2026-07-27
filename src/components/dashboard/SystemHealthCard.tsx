import { memo } from 'react';
import { Server, HardDrive, Shield, Wifi, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardSystemStatus } from '@/types/dashboard';

const ICONS = [Server, HardDrive, Shield, Wifi];
const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  operational: { icon: CheckCircle2, color: 'text-success-600 bg-success-50', label: 'Operational' },
  degraded: { icon: AlertCircle, color: 'text-warning-600 bg-warning-50', label: 'Degraded' },
  outage: { icon: XCircle, color: 'text-error-600 bg-error-50', label: 'Outage' },
};

interface SystemHealthCardProps { items: DashboardSystemStatus[]; loading?: boolean; }

function SystemHealthCardComponent({ items, loading = false }: SystemHealthCardProps) {
  if (loading) return <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">System Status</h3>
      <div className="mt-3 space-y-2">{items.map((item, i) => {
        const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.operational!; const Icon = config.icon; const ServiceIcon = ICONS[i % ICONS.length] ?? Server;
        return <div key={item.label} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100"><ServiceIcon className="h-4 w-4 text-neutral-500" /></div><div className="flex-1"><p className="text-sm font-medium text-neutral-800">{item.label}</p>{item.latencyMs != null && item.latencyMs > 0 && <p className="text-[10px] text-neutral-400">{item.latencyMs}ms</p>}</div><div className={cn('flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium', config.color)}><Icon className="h-3 w-3" />{config.label}</div></div>;
      })}</div>
    </div>
  );
}

export const SystemHealthCard = memo(SystemHealthCardComponent);
