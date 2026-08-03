import { memo, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

function UpdateAvailableDialogComponent() {
  const { updateAvailable, updateApp } = usePWA();
  const handleDismiss = useCallback(() => { const dialog = document.getElementById('update-dialog'); if (dialog) dialog.style.display = 'none'; }, []);
  if (!updateAvailable) return null;
  return (
    <div id="update-dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="update-title">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="update-title" className="text-lg font-semibold text-neutral-900">Update Available</h2>
          <button onClick={handleDismiss} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Dismiss update"><X className="h-4 w-4" /></button>
        </div>
        <p className="mb-6 text-sm text-neutral-600">A new version of the app is available. Would you like to update now?</p>
        <div className="flex justify-end gap-3">
          <button onClick={handleDismiss} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Later</button>
          <button onClick={updateApp} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"><RefreshCw className="h-4 w-4" /> Update Now</button>
        </div>
      </div>
    </div>
  );
}
export const UpdateAvailableDialog = memo(UpdateAvailableDialogComponent);
