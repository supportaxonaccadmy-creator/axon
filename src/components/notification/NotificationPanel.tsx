import { memo } from 'react';
import { BellOff } from 'lucide-react';
import { NotificationCard } from './NotificationCard';
import { Spinner } from '@/components/feedback/Spinner';
import type { NotificationWithRecipient } from '@/services/notification';

interface NotificationPanelProps {
  notifications: NotificationWithRecipient[];
  loading: boolean;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  maxHeight?: string | undefined;
}

function NotificationPanelComponent({ notifications, loading, onMarkRead, onDelete, maxHeight = '400px' }: NotificationPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-6 w-6 text-primary-500" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BellOff className="h-10 w-10 text-neutral-300" />
        <p className="mt-2 text-sm text-neutral-500">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight }} role="list">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export const NotificationPanel = memo(NotificationPanelComponent);
