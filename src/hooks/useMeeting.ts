import { useState, useCallback } from 'react';
import { liveClassService, attendanceService } from '@/services/live';
import type { LiveClass, LiveClassStatus } from '@/services/live';

export function useMeeting() {
  const [currentClass, setCurrentClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinMeeting = useCallback(async (liveClass: LiveClass): Promise<{ error: string | null }> => {
    if (!liveClass.meetingUrl) return { error: 'No meeting URL available' };
    try {
      window.open(liveClass.meetingUrl, '_blank', 'noopener,noreferrer');
      return { error: null };
    } catch {
      return { error: 'Failed to open meeting URL' };
    }
  }, []);

  const leaveMeeting = useCallback(async (attendanceId: string): Promise<{ error: string | null }> => {
    setLoading(true);
    const { error: err } = await attendanceService.recordLeave(attendanceId);
    setLoading(false);
    if (err) setError(err);
    else setCurrentClass(null);
    return { error: err };
  }, []);

  const startClass = useCallback(async (id: string): Promise<{ data: LiveClass | null; error: string | null }> => {
    setLoading(true);
    const { data, error: err } = await liveClassService.updateStatus(id, 'live');
    setLoading(false);
    if (err) setError(err);
    else if (data) setCurrentClass(data);
    return { data, error: err };
  }, []);

  const endClass = useCallback(async (id: string): Promise<{ data: LiveClass | null; error: string | null }> => {
    setLoading(true);
    const { data, error: err } = await liveClassService.updateStatus(id, 'completed');
    setLoading(false);
    if (err) setError(err);
    else setCurrentClass(null);
    return { data, error: err };
  }, []);

  const cancelClass = useCallback(async (id: string): Promise<{ data: LiveClass | null; error: string | null }> => {
    setLoading(true);
    const { data, error: err } = await liveClassService.updateStatus(id, 'cancelled');
    setLoading(false);
    if (err) setError(err);
    else setCurrentClass(null);
    return { data, error: err };
  }, []);

  const setStatus = useCallback(async (id: string, status: LiveClassStatus): Promise<{ data: LiveClass | null; error: string | null }> => {
    setLoading(true);
    const { data, error: err } = await liveClassService.updateStatus(id, status);
    setLoading(false);
    if (err) setError(err);
    else if (data) setCurrentClass(data);
    return { data, error: err };
  }, []);

  return {
    currentClass, loading, error,
    joinMeeting, leaveMeeting, startClass, endClass, cancelClass, setStatus,
  };
}