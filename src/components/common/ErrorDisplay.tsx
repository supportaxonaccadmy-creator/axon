import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface ErrorDisplayProps {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorDisplay({ title = 'Something went wrong', message = 'An unexpected error occurred. Please try again.', action, className }: ErrorDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
        <svg className="h-6 w-6 text-error-600" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
