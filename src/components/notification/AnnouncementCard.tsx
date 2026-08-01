import { memo } from 'react';
import { Pin, Megaphone, Globe, Calendar, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/services/notification';
import type { Announcement } from '@/services/notification';

interface AnnouncementCardProps {
  announcement: Announcement;
  variant?: 'default' | 'banner' | undefined;
  onPin?: ((id: string, isPinned: boolean) => void) | undefined;
  onEdit?: ((announcement: Announcement) => void) | undefined;
  onDelete?: ((id: string) => void) | undefined;
  onPublish?: ((id: string) => void) | undefined;
  onArchive?: ((id: string) => void) | undefined;
  isAdmin?: boolean | undefined;
}

function AnnouncementCardComponent({ announcement, variant = 'default', onPin, onEdit, onDelete, onPublish, onArchive, isAdmin = false }: AnnouncementCardProps) {
  if (variant === 'banner') {
    return (
      <div className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3',
        announcement.isPinned ? 'border-amber-200 bg-amber-50' : 'border-primary-200 bg-primary-50',
      )}>
        {announcement.isPinned ? <Pin className="h-4 w-4 shrink-0 text-amber-500" /> : <Megaphone className="h-4 w-4 shrink-0 text-primary-500" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900">{announcement.title}</p>
          <p className="text-xs text-neutral-600 line-clamp-1">{announcement.body}</p>
        </div>
        {announcement.isGlobal && <Badge variant="info"><Globe className="mr-1 h-3 w-3" />Global</Badge>}
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md',
      announcement.isPinned ? 'border-amber-200 ring-1 ring-amber-100' : 'border-neutral-200',
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          announcement.isPinned ? 'bg-amber-50' : 'bg-primary-50',
        )}>
          {announcement.isPinned ? <Pin className="h-5 w-5 text-amber-500" /> : <Megaphone className="h-5 w-5 text-primary-500" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-neutral-900">{announcement.title}</h3>
            <div className="flex shrink-0 items-center gap-1">
              {announcement.isPinned && <Badge variant="warning">Pinned</Badge>}
              {announcement.isGlobal && <Badge variant="info">Global</Badge>}
              {announcement.status === 'draft' && <Badge variant="default">Draft</Badge>}
              {announcement.status === 'archived' && <Badge variant="default">Archived</Badge>}
            </div>
          </div>

          <p className="mt-2 text-sm text-neutral-600 whitespace-pre-line">{announcement.body}</p>

          {announcement.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-lg">
              <img src={announcement.imageUrl} alt={announcement.title} className="max-h-48 w-full object-cover" />
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatRelativeTime(announcement.createdAt)}
            </span>
            {announcement.scheduledFor && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Scheduled {formatRelativeTime(announcement.scheduledFor)}
              </span>
            )}
            {announcement.expiresAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Expires {formatRelativeTime(announcement.expiresAt)}
              </span>
            )}
          </div>

          {isAdmin && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
              {onPin && (
                <button
                  onClick={() => onPin(announcement.id, !announcement.isPinned)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-100"
                >
                  <Pin className="h-3 w-3" /> {announcement.isPinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(announcement)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary-600 transition-colors hover:bg-primary-50"
                >
                  Edit
                </button>
              )}
              {onPublish && announcement.status === 'draft' && (
                <button
                  onClick={() => onPublish(announcement.id)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-success-600 transition-colors hover:bg-success-50"
                >
                  Publish
                </button>
              )}
              {onArchive && announcement.status === 'published' && (
                <button
                  onClick={() => onArchive(announcement.id)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-100"
                >
                  Archive
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(announcement.id)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-error-500 transition-colors hover:bg-error-50"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const AnnouncementCard = memo(AnnouncementCardComponent);
