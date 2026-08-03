import { memo } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/utils/cn';

function OfflineIndicatorComponent() {
  const { online } = usePWA();
  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', online ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700')} role="status" aria-live="polite">
      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {online ? 'Online' : 'Offline'}
    </div>
  );
}
export const OfflineIndicator = memo(OfflineIndicatorComponent);
