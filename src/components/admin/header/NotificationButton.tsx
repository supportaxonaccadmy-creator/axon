import { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

const NOTIFICATIONS = [
  'New student registration pending review',
  'Assessment submissions need grading',
  'System update scheduled tonight',
];

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const count = NOTIFICATIONS.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications (${count} unread)`}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700',
          open && 'bg-neutral-50 text-neutral-700',
        )}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-neutral-200 bg-white shadow-lg animate-fade-in"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="border-b border-neutral-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-800">Notifications</h3>
            </div>
            <div className="py-2">
              {NOTIFICATIONS.map((msg, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-neutral-50">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  <p className="text-xs text-neutral-700 leading-relaxed">{msg}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-100 px-4 py-2.5">
              <button onClick={() => setOpen(false)} className="text-xs text-primary-600 font-medium hover:underline">
                Mark all as read
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
