import { memo, useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Bell, Info, AlertCircle, Megaphone, Video, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useStudentNotifications } from '@/hooks/useStudentNotifications';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
  announcement: { icon: Megaphone, color: 'text-primary-600 bg-primary-50' },
  new_content: { icon: BookOpen, color: 'text-accent-600 bg-accent-50' },
  live_class: { icon: Video, color: 'text-error-600 bg-error-50' },
  course_update: { icon: Info, color: 'text-primary-600 bg-primary-50' },
  system: { icon: AlertCircle, color: 'text-warning-600 bg-warning-50' },
} as const;

function NotificationPanelComponent() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useStudentNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => { if (e.key === 'Escape') setIsOpen(false); };

  return (
    <div ref={panelRef} className="relative">
      <button onClick={() => setIsOpen((v) => !v)} onKeyDown={handleKeyDown} aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`} aria-expanded={isOpen} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg animate-fade-in" role="dialog" aria-label="Notifications">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3"><h3 className="text-sm font-semibold text-neutral-800">Notifications</h3>{unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline">Mark all read</button>}</div>
          <div className="max-h-96 overflow-y-auto">
            {loading && <div className="flex items-center justify-center py-8"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" /></div>}
            {!loading && notifications.length === 0 && <div className="flex flex-col items-center gap-2 py-8 text-center"><Bell className="h-8 w-8 text-neutral-300" /><p className="text-sm text-neutral-500">No notifications yet</p></div>}
            {!loading && notifications.length > 0 && (
              <div className="divide-y divide-neutral-50">
                {notifications.map((n) => { const typeInfo = TYPE_ICONS[n.type] ?? TYPE_ICONS.announcement; const Icon = typeInfo.icon; return (
                  <div key={n.id} onClick={() => markAsRead(n.id)} className={cn('flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-neutral-50', !n.read && 'bg-primary-50/50')}>
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', typeInfo.color)}><Icon className="h-4 w-4" strokeWidth={2} /></div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-neutral-800">{n.title}</p><p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">{n.message}</p><p className="mt-1 text-[10px] text-neutral-400">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p></div>
                    {!n.read && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-label="Unread" />}
                  </div>
                ); })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const NotificationPanel = memo(NotificationPanelComponent);
