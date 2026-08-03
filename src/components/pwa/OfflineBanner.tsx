import { memo } from 'react';
import { WifiOff } from 'lucide-react';

function OfflineBannerComponent() {
  return (
    <div className="flex items-center justify-center gap-2 bg-error-500 px-4 py-2 text-sm font-medium text-white" role="alert" aria-live="assertive">
      <WifiOff className="h-4 w-4" />
      You are offline. Some features may be limited.
    </div>
  );
}
export const OfflineBanner = memo(OfflineBannerComponent);
