import { memo, useState, useEffect } from 'react';
import { HardDrive, CheckCircle, XCircle, Loader } from 'lucide-react';
import { healthCheckService } from '@/services/devops';
import type { HealthCheckResult } from '@/services/devops';

function StorageHealthCardComponent() {
  const [storageHealth, setStorageHealth] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void healthCheckService.checkStorage().then((r) => { setStorageHealth(r); setLoading(false); }); }, []);
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><HardDrive className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Storage Health</h3></div>{loading ? <div className="flex items-center gap-2 text-sm text-neutral-400"><Loader className="h-4 w-4 animate-spin" /> Checking storage...</div> : storageHealth && (<><div className="mb-4 flex items-center gap-2 rounded-lg bg-neutral-50 p-3">{storageHealth.healthy ? <CheckCircle className="h-5 w-5 text-success-500" /> : <XCircle className="h-5 w-5 text-error-500" />}<span className="text-sm font-medium text-neutral-700">{storageHealth.message}</span></div><div className="text-xs text-neutral-500"><div className="flex justify-between"><span>Response Time</span><span className="font-mono text-neutral-400">{Math.round(storageHealth.responseTime)}ms</span></div><div className="flex justify-between"><span>Last Checked</span><span className="font-mono text-neutral-400">{new Date(storageHealth.timestamp).toLocaleString()}</span></div></div></>)}</div>);
}
export const StorageHealthCard = memo(StorageHealthCardComponent);
