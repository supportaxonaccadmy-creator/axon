import { memo } from 'react';
import { Wifi, WifiOff, Loader } from 'lucide-react';
import { networkService } from '@/services/pwa';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/utils/cn';

function NetworkStatusBadgeComponent() {
  const { online } = usePWA();
  const connType = networkService.getConnectionType();
  const isSlow = networkService.isSlowConnection();
  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', online ? (isSlow ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700') : 'bg-error-50 text-error-700')} role="status" aria-live="polite">
      {online ? (isSlow ? <Loader className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />) : <WifiOff className="h-3 w-3" />}
      {online ? (isSlow ? `Slow (${connType})` : 'Online') : 'Offline'}
    </div>
  );
}
export const NetworkStatusBadge = memo(NetworkStatusBadgeComponent);
