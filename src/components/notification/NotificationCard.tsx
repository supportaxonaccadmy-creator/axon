import { memo, useCallback } from 'react';
import { ShoppingCart, GraduationCap, CreditCard, Clock, Radio, FileText, PlayCircle, HelpCircle, Award, BadgeCheck, Megaphone, MessageSquare, Check, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { NOTIFICATION_TYPE_LABELS, formatRelativeTime } from '@/services/notification';
import type { NotificationWithRecipient, NotificationType } from '@/services/notification';

const ICON_MAP: Record<NotificationType, typeof Bell> = {
  course_purchased: ShoppingCart,
  enrollment_success: GraduationCap,
  payment_failed: CreditCard,
  live_class_reminder: Clock,
  live_class_started: Radio,
  assignment_available: FileText,
  pdf_uploaded: FileText,
  video_uploaded: PlayCircle,
  mcq_available: HelpCircle,
  course_completed: Award,
  certificate_ready: BadgeCheck,
  system_announcement: Megaphone,
  custom_admin_message: MessageSquare,
};

const ICON_COLORS: Record<NotificationType, string> = {
  course_purchased: 'text-green-500 bg-green-50',
  enrollment_success: 'text-blue-500 bg-blue-50',
  payment_failed: 'text-red-500 bg-red-50',
  live_class_reminder: 'text-orange-500 bg-orange-50',
  live_class_started: 'text-red-500 bg-red-50',
  assignment_available: 'text-purple-500 bg-purple-50',
  pdf_uploaded: 'text-indigo-500 bg-indigo-50',
  video_uploaded: 'text-blue-500 bg-blue-50',
  mcq_available: 'text-teal-500 bg-teal-50',
  course_completed: 'text-amber-500 bg-amber-50',
  certificate_ready: 'text-green-500 bg-green-50',
  system_announcement: 'text-neutral-500 bg-neutral-100',
  custom_admin_message: 'text-primary-500 bg-primary-50',
};

import { Bell } from 'lucide-react';

interface NotificationCardProps {
  notification: NotificationWithRecipient;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  compact?: boolean | undefined;
}

function NotificationCardComponent({ notification, onMarkRead, onDelete, compact = false }: NotificationCardProps) {
  const Icon = ICON_MAP[notification.type] ?? Bell;
  const iconColor = ICON_COLORS[notification.type] ?? 'text-neutral-500 bg-neutral-100';

  const handleClick = useCallback(() => {
    if (!notification.isRead) onMarkRead(notification.id);
  }, [notification.isRead, notification.id, onMarkRead]);

  return (
    <div
      className={cn(
        'flex gap-3 border-b border-neutral-50 px-4 py-3 transition-colors hover:bg-neutral-50',
        !notification.isRead && 'bg-primary-50/30',
      )}
      role="listitem"
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconColor)}>
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0 flex-1" onClick={handleClick}>
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium', notification.isRead ? 'text-neutral-700' : 'text-neutral-900')}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-label="Unread" />
          )}
        </div>

        {!compact && (
          <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{notification.message}</p>
        )}

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">{formatRelativeTime(notification.createdAt)}</span>
          <span className="text-[11px] text-neutral-300">·</span>
          <span className="text-[11px] text-neutral-400">{NOTIFICATION_TYPE_LABELS[notification.type]}</span>
        </div>

        {(notification.actionUrl || !notification.isRead) && (
          <div className="mt-2 flex items-center gap-2">
            {notification.actionUrl && (
              <Link to={notification.actionUrl} className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
                {notification.actionLabel ?? 'View'} <ArrowRight className="h-3 w-3" />
              </Link>
            )}
            {!notification.isRead && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-primary-600"
                aria-label="Mark as read"
              >
                <Check className="h-3 w-3" /> Mark read
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-error-500"
              aria-label="Delete notification"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const NotificationCard = memo(NotificationCardComponent);
