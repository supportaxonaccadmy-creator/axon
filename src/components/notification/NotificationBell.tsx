import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';
import { Button } from '@/components/ui/Button';

interface NotificationBellProps {
  studentId: string | null;
  className?: string | undefined;
}

function NotificationBellComponent({ studentId, className }: NotificationBellProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications(studentId);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={toggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => void markAllAsRead()}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary-600 transition-colors hover:bg-primary-50"
                    aria-label="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <NotificationPanel
              notifications={notifications}
              loading={loading}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
            />

            <div className="border-t border-neutral-100 px-4 py-2">
              <Link to="/student/notifications" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" fullWidth>View all notifications</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const NotificationBell = memo(NotificationBellComponent);
