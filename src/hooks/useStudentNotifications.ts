import { useState, useEffect, useCallback } from 'react';
import type { StudentAnnouncement } from '@/types/studentDashboard';
import { studentDashboardService } from '@/services/student';

export interface StudentNotification {
  id: string; type: 'announcement' | 'new_content' | 'live_class' | 'course_update' | 'system';
  title: string; message: string; createdAt: string; read: boolean; actionUrl?: string | null;
}

export interface UseStudentNotificationsResult {
  notifications: StudentNotification[]; announcements: StudentAnnouncement[]; unreadCount: number;
  loading: boolean; error: string | null; markAsRead: (id: string) => void; markAllAsRead: () => void; refresh: () => void;
}

function toNotification(a: StudentAnnouncement): StudentNotification {
  return { id: a.id, type: a.type === 'warning' ? 'system' : 'announcement', title: a.title, message: a.message, createdAt: a.createdAt, read: a.read, actionUrl: null };
}

export function useStudentNotifications(): UseStudentNotificationsResult {
  const [state, setState] = useState<{ notifications: StudentNotification[]; announcements: StudentAnnouncement[]; loading: boolean; error: string | null }>({ notifications: [], announcements: [], loading: true, error: null });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    studentDashboardService.getAnnouncements().then((result) => {
      const announcements = result.data ?? [];
      setState({ notifications: announcements.map(toNotification), announcements, loading: false, error: result.error });
    }).catch((err: unknown) => { setState({ notifications: [], announcements: [], loading: false, error: err instanceof Error ? err.message : 'Failed to load' }); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAsRead = useCallback((id: string) => { setState((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })); }, []);
  const markAllAsRead = useCallback(() => { setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })); }, []);
  const unreadCount = state.notifications.filter((n) => !n.read).length;
  return { ...state, markAsRead, markAllAsRead, unreadCount, refresh: load };
}
