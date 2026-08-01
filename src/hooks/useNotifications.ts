import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '@/services/notification';
import type { NotificationWithRecipient, NotificationFilter, NotificationType } from '@/services/notification';

export function useNotifications(studentId: string | null) {
  const [notifications, setNotifications] = useState<NotificationWithRecipient[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>({});
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await notificationService.getForStudent(studentId, filter);
    if (err) setError(err);
    else { setNotifications(data); setError(null); }
    setLoading(false);
  }, [studentId, filter]);

  const fetchUnreadCount = useCallback(async () => {
    if (!studentId) return;
    const { data } = await notificationService.getUnreadCount(studentId);
    setUnreadCount(data);
  }, [studentId]);

  useEffect(() => {
    void fetchNotifications();
    void fetchUnreadCount();

    if (studentId) {
      unsubscribeRef.current = notificationService.subscribeToUnreadCount(studentId, (count) => {
        setUnreadCount(count);
      });
    }

    return () => {
      if (unsubscribeRef.current) { unsubscribeRef.current(); unsubscribeRef.current = null; }
    };
  }, [fetchNotifications, fetchUnreadCount, studentId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!studentId) return;
    const { error: err } = await notificationService.markAsRead(studentId, notificationId);
    if (!err) {
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, [studentId]);

  const markAllAsRead = useCallback(async () => {
    if (!studentId) return;
    const { error: err } = await notificationService.markAllAsRead(studentId);
    if (!err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    }
  }, [studentId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!studentId) return;
    const { error: err } = await notificationService.deleteNotification(studentId, notificationId);
    if (!err) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      void fetchUnreadCount();
    }
  }, [studentId, fetchUnreadCount]);

  const filterByType = useCallback((type: NotificationType | null) => {
    setFilter((prev) => ({ ...prev, type }));
  }, []);

  const filterByRead = useCallback((isRead: boolean | null) => {
    setFilter((prev) => ({ ...prev, isRead }));
  }, []);

  const search = useCallback((query: string | null) => {
    setFilter((prev) => ({ ...prev, search: query }));
  }, []);

  return {
    notifications, unreadCount, loading, error,
    markAsRead, markAllAsRead, deleteNotification,
    filterByType, filterByRead, search,
    refetch: fetchNotifications,
  };
}
