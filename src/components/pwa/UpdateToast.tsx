import { memo, useCallback } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

function UpdateToastComponent() {
  const { updateAvailable, updateApp } = usePWA();
  const handleUpdate = useCallback(() => { void updateApp(); }, [updateApp]);
  if (!updateAvailable) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-success-200 bg-white p-4 shadow-lg" role="alert" aria-live="polite">
      <CheckCircle className="h-5 w-5 flex-shrink-0 text-success-600" />
      <div className="flex-1"><p className="text-sm font-semibold text-neutral-900">Update Ready</p><p className="text-xs text-neutral-500">Refresh to get the latest version</p></div>
      <button onClick={handleUpdate} className="flex items-center gap-1.5 rounded-lg bg-success-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-success-700"><RefreshCw className="h-3 w-3" /> Refresh</button>
    </div>
  );
}
export const UpdateToast = memo(UpdateToastComponent);
