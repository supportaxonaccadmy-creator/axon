import { cn } from '@/utils/cn';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ visible, message = 'Loading...', className }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className={cn('fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/30 backdrop-blur-sm', className)}>
      <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-xl">
        <svg className="h-10 w-10 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-3 text-sm font-medium text-neutral-700">{message}</p>
      </div>
    </div>
  );
}
