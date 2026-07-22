import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type DialogVariant = 'default' | 'danger' | 'success' | 'warning';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  children?: ReactNode;
}

const confirmVariantClasses: Record<DialogVariant, string> = {
  default: 'bg-primary-600 hover:bg-primary-700',
  danger: 'bg-error-600 hover:bg-error-700',
  success: 'bg-success-600 hover:bg-success-700',
  warning: 'bg-warning-600 hover:bg-warning-700',
};

export function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  children,
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl animate-scale-in">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          {description && <p className="mt-2 text-sm text-neutral-500">{description}</p>}
          {children}
        </div>
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                confirmVariantClasses[variant],
              )}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
