import { memo } from 'react';
import { CloudOff, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function OfflinePageComponent() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6" role="main">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-50"><CloudOff className="h-10 w-10 text-error-500" /></div>
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">You're Offline</h1>
      <p className="mb-6 max-w-md text-center text-sm text-neutral-500">It looks like you've lost your internet connection. You can still access some content offline, or try reconnecting.</p>
      <div className="flex gap-3">
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"><RefreshCw className="h-4 w-4" /> Try Again</button>
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"><Home className="h-4 w-4" /> Go Home</button>
      </div>
    </div>
  );
}
export const OfflinePage = memo(OfflinePageComponent);
