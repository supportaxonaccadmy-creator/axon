import { SettingsLayout } from './SettingsDashboardPage';
import { SettingCard, StatusBadge } from '@/components/admin/settings';
import { useSystemHealth } from '@/hooks/useAdminSettings';
import { format } from 'date-fns';
import { Database, HardDrive, Server, Globe, Tag, MemoryStick, Archive } from 'lucide-react';

export function SystemHealthPage() {
  const { health, loading } = useSystemHealth();

  const items = [
    { label: 'Supabase Status', value: health.supabaseStatus, icon: Database, isStatus: true },
    { label: 'Database Status', value: health.databaseStatus, icon: Server, isStatus: true },
    { label: 'Storage Usage', value: health.storageUsage, icon: HardDrive },
    { label: 'Memory Usage', value: health.memoryUsage, icon: MemoryStick },
    { label: 'Environment', value: health.environment, icon: Globe },
    { label: 'Version', value: health.version, icon: Tag },
    { label: 'Last Backup', value: format(new Date(health.lastBackup), 'MMM d, yyyy h:mm a'), icon: Archive },
  ];

  return (
    <SettingsLayout title="System Health" description="Monitor system status and resources">
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-xl border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50"><Icon className="h-5 w-5 text-primary-600" /></div>
                <div className="min-w-0 flex-1"><p className="text-xs text-neutral-500">{item.label}</p>{item.isStatus ? <StatusBadge status={item.value} /> : <p className="truncate text-sm font-semibold text-neutral-900">{item.value}</p>}</div>
              </div>
            );
          })}
        </div>
      )}
      <SettingCard title="System Information" description="Detailed environment information">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex justify-between rounded-lg bg-neutral-50 px-4 py-2"><span className="text-sm text-neutral-500">Platform</span><span className="text-sm font-medium text-neutral-900">Supabase + React</span></div>
          <div className="flex justify-between rounded-lg bg-neutral-50 px-4 py-2"><span className="text-sm text-neutral-500">Runtime</span><span className="text-sm font-medium text-neutral-900">Vite + Deno Edge</span></div>
          <div className="flex justify-between rounded-lg bg-neutral-50 px-4 py-2"><span className="text-sm text-neutral-500">Database</span><span className="text-sm font-medium text-neutral-900">PostgreSQL (Supabase)</span></div>
          <div className="flex justify-between rounded-lg bg-neutral-50 px-4 py-2"><span className="text-sm text-neutral-500">Storage</span><span className="text-sm font-medium text-neutral-900">Supabase Storage</span></div>
        </div>
      </SettingCard>
    </SettingsLayout>
  );
}
