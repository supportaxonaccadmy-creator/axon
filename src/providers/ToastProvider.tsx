import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { ToastItem, ToastOptions } from '@/types/common';
import { DEFAULT_VALUES } from '@/constants/app';
import { uuid } from '@/utils/helpers';
import { cn } from '@/utils/cn';

interface ToastContextValue {
  toasts: ToastItem[];
  show: (type: ToastItem['type'], title: string, message?: string, options?: ToastOptions) => void;
  success: (title: string, message?: string, options?: ToastOptions) => void;
  error: (title: string, message?: string, options?: ToastOptions) => void;
  warning: (title: string, message?: string, options?: ToastOptions) => void;
  info: (title: string, message?: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastItem['type'], title: string, message?: string, options?: ToastOptions) => {
      const id = uuid();
      const duration = options?.duration ?? DEFAULT_VALUES.TOAST_DURATION;
      const dismissible = options?.dismissible ?? true;

      const toast: ToastItem = { id, type, title, message, duration, dismissible };
      setToasts((prev) => [...prev, toast].slice(-DEFAULT_VALUES.TOAST_MAX_VISIBLE));

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const success = useCallback(
    (title: string, message?: string, options?: ToastOptions) => show('success', title, message, options),
    [show],
  );

  const error = useCallback(
    (title: string, message?: string, options?: ToastOptions) => show('error', title, message, options),
    [show],
  );

  const warning = useCallback(
    (title: string, message?: string, options?: ToastOptions) => show('warning', title, message, options),
    [show],
  );

  const info = useCallback(
    (title: string, message?: string, options?: ToastOptions) => show('info', title, message, options),
    [show],
  );

  return (
    <ToastContext.Provider value={{ toasts, show, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const toastStyles: Record<ToastItem['type'], { container: string; icon: ReactNode }> = {
  success: {
    container: 'border-success-200 bg-success-50',
    icon: (
      <svg className="h-5 w-5 text-success-600" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    container: 'border-error-200 bg-error-50',
    icon: (
      <svg className="h-5 w-5 text-error-600" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  warning: {
    container: 'border-warning-200 bg-warning-50',
    icon: (
      <svg className="h-5 w-5 text-warning-600" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    container: 'border-blue-200 bg-blue-50',
    icon: (
      <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.177.073l.5.5a.25.25 0 00.353 0l.5-.5A.25.25 0 0111 10.5h.25a.75.75 0 000-1.5H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];

        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-slide-in-right min-w-[300px] max-w-[400px]',
              style.container,
            )}
          >
            <div className="shrink-0">{style.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-sm text-neutral-600">{toast.message}</p>}
            </div>
            {toast.dismissible && (
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-neutral-400 transition-colors hover:text-neutral-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
