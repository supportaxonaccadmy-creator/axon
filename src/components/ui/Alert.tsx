import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

const variantClasses: Record<AlertVariant, { container: string; title: string }> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    title: 'text-blue-900',
  },
  success: {
    container: 'bg-success-50 border-success-200 text-success-800',
    title: 'text-success-900',
  },
  warning: {
    container: 'bg-warning-50 border-warning-200 text-warning-800',
    title: 'text-warning-900',
  },
  error: {
    container: 'bg-error-50 border-error-200 text-error-800',
    title: 'text-error-900',
  },
};

export function Alert({ variant = 'info', title, children, className, onClose }: AlertProps) {
  const styles = variantClasses[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        styles.container,
        className,
      )}
    >
      <div className="flex-1">
        {title && <p className={cn('font-medium', styles.title)}>{title}</p>}
        <div className={cn(title && 'mt-1', 'text-sm')}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-current opacity-60 transition-opacity hover:opacity-100"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  );
}
