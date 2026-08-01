import { memo, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import type { Announcement } from '@/services/notification';

interface AnnouncementBannerProps {
  announcement: Announcement;
  onDismiss?: (() => void) | undefined;
  onAction?: (() => void) | undefined;
  actionLabel?: string | undefined;
}

function AnnouncementBannerComponent({ announcement, onDismiss, onAction, actionLabel = 'Learn more' }: AnnouncementBannerProps) {
  useEffect(() => {
    if (onDismiss) {
      const key = `announcement_dismissed_${announcement.id}`;
      if (sessionStorage.getItem(key)) return;
    }
  }, [announcement.id, onDismiss]);

  const handleDismiss = () => {
    if (onDismiss) {
      sessionStorage.setItem(`announcement_dismissed_${announcement.id}`, '1');
      onDismiss();
    }
  };

  return (
    <div className={cn(
      'relative flex items-center gap-3 overflow-hidden rounded-lg border px-4 py-3',
      announcement.isPinned ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50' : 'border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50',
    )}>
      <Megaphone className="h-5 w-5 shrink-0 text-primary-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{announcement.title}</p>
        <p className="text-xs text-neutral-600 line-clamp-1">{announcement.body}</p>
      </div>
      {onAction && (
        <Button size="sm" variant="primary" onClick={onAction} className="shrink-0">
          {actionLabel}
        </Button>
      )}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/50 hover:text-neutral-600"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export const AnnouncementBanner = memo(AnnouncementBannerComponent);
