import { useState, useMemo, useCallback } from 'react';
import { Bell, CheckCheck, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { NotificationCard } from '@/components/notification';
import { useNotifications } from '@/hooks/useNotifications';
import { useCurrentUser } from '@/hooks/useProfile';
import { NOTIFICATION_TYPE_LABELS } from '@/services/notification';
import type { NotificationType } from '@/services/notification';
import type { Option } from '@/types/common';

export function NotificationsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, filterByType, filterByRead, search } = useNotifications(studentId);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [readFilter, setReadFilter] = useState<string>('');

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    search(e.target.value || null);
  }, [search]);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
    filterByType(e.target.value ? (e.target.value as NotificationType) : null);
  }, [filterByType]);

  const handleReadChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setReadFilter(e.target.value);
    if (e.target.value === '') filterByRead(null);
    else if (e.target.value === 'unread') filterByRead(false);
    else filterByRead(true);
  }, [filterByRead]);

  const typeOptions: Option[] = [
    { value: '', label: 'All Types' },
    ...Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const readOptions: Option[] = [
    { value: '', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
  ];

  const hasFilters = useMemo(() => Boolean(searchQuery || typeFilter || readFilter), [searchQuery, typeFilter, readFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Notifications</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => void markAllAsRead()}>
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search notifications..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-400" />
              <Select options={typeOptions} value={typeFilter} onChange={handleTypeChange} className="min-w-40" />
              <Select options={readOptions} value={readFilter} onChange={handleReadChange} className="min-w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-neutral-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-neutral-300" />
              <p className="mt-2 text-sm text-neutral-500">
                {hasFilters ? 'No notifications match your filters' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div role="list">
              {notifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
