import { memo } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { EmailStatus, NotificationPriority } from '@/services/notification';

interface NotificationStatusBadgeProps {
  status?: EmailStatus | undefined;
  priority?: NotificationPriority | undefined;
  isRead?: boolean | undefined;
  type?: 'email' | 'priority' | 'read' | undefined;
}

function NotificationStatusBadgeComponent({ status, priority, isRead, type = 'email' }: NotificationStatusBadgeProps) {
  if (type === 'email' && status) {
    const variants: Record<EmailStatus, 'success' | 'error' | 'warning'> = {
      sent: 'success',
      failed: 'error',
      pending: 'warning',
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  }

  if (type === 'priority' && priority) {
    const variants: Record<NotificationPriority, 'default' | 'info' | 'warning' | 'error'> = {
      low: 'default',
      normal: 'info',
      high: 'warning',
      urgent: 'error',
    };
    return <Badge variant={variants[priority]}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
  }

  if (type === 'read' && isRead !== undefined) {
    return (
      <Badge variant={isRead ? 'default' : 'primary'}>
        {isRead ? 'Read' : 'Unread'}
      </Badge>
    );
  }

  return null;
}

export const NotificationStatusBadge = memo(NotificationStatusBadgeComponent);
