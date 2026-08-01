import { useState, useEffect, useCallback } from 'react';
import { announcementService } from '@/services/notification';
import type { Announcement } from '@/services/notification';

export function useAnnouncements(studentId: string | null, isAdmin: boolean = false) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    if (isAdmin) {
      const { data, error: err } = await announcementService.getAll();
      if (err) setError(err);
      else { setAnnouncements(data); setError(null); }
    } else if (studentId) {
      const { data, error: err } = await announcementService.getForStudent(studentId);
      if (err) setError(err);
      else { setAnnouncements(data); setError(null); }
    }
    setLoading(false);
  }, [studentId, isAdmin]);

  useEffect(() => { void fetchAnnouncements(); }, [fetchAnnouncements]);

  const createAnnouncement = useCallback(async (adminId: string, input: Parameters<typeof announcementService.create>[1]) => {
    const { data, error: err } = await announcementService.create(adminId, input);
    if (!err && data) { void fetchAnnouncements(); }
    return { data, error: err };
  }, [fetchAnnouncements]);

  const updateAnnouncement = useCallback(async (id: string, input: Parameters<typeof announcementService.update>[1]) => {
    const { data, error: err } = await announcementService.update(id, input);
    if (!err) { void fetchAnnouncements(); }
    return { data, error: err };
  }, [fetchAnnouncements]);

  const deleteAnnouncement = useCallback(async (id: string) => {
    const { error: err } = await announcementService.delete(id);
    if (!err) { void fetchAnnouncements(); }
    return { error: err };
  }, [fetchAnnouncements]);

  const togglePin = useCallback(async (id: string, isPinned: boolean) => {
    const { error: err } = await announcementService.togglePin(id, isPinned);
    if (!err) { void fetchAnnouncements(); }
    return { error: err };
  }, [fetchAnnouncements]);

  const publish = useCallback(async (id: string) => {
    const { error: err } = await announcementService.publish(id);
    if (!err) { void fetchAnnouncements(); }
    return { error: err };
  }, [fetchAnnouncements]);

  const archive = useCallback(async (id: string) => {
    const { error: err } = await announcementService.archive(id);
    if (!err) { void fetchAnnouncements(); }
    return { error: err };
  }, [fetchAnnouncements]);

  return {
    announcements, loading, error,
    createAnnouncement, updateAnnouncement, deleteAnnouncement,
    togglePin, publish, archive, refetch: fetchAnnouncements,
  };
}
