import { memo, useState, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

function InstallAppBannerComponent() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const handleInstall = useCallback(async () => { await promptInstall(); setDismissed(true); }, [promptInstall]);
  const handleDismiss = useCallback(() => setDismissed(true), []);
  if (!canInstall || dismissed) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-primary-200 bg-white p-4 shadow-lg sm:left-auto sm:right-4" role="alert" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50"><Download className="h-5 w-5 text-primary-600" /></div>
        <div className="flex-1"><p className="text-sm font-semibold text-neutral-900">Install App</p><p className="text-xs text-neutral-500">Add to your home screen for a better experience</p></div>
        <button onClick={handleInstall} className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700" aria-label="Install app">Install</button>
        <button onClick={handleDismiss} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Dismiss"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
export const InstallAppBanner = memo(InstallAppBannerComponent);
