import { useState, useCallback } from 'react';
import { liveClassService } from '@/services/live';
import { attendanceService } from '@/services/live';
import { liveReminderService } from '@/services/live';
import type { LiveClass } from '@/services/live';

export function useMeeting() {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeClass, setActiveClass] = useState<LiveClass | null>(null);

  const joinMeeting = useCallback(async (liveClass: LiveClass, studentId: string) => {
    setJoining(true);
    setError(null);

    try {
      const { error: joinError } = await attendanceService.recordJoin(liveClass.id, studentId);
      if (joinError) { setError(joinError); setJoining(false); return { error: joinError }; }

      setActiveClass(liveClass);
      setJoining(false);
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setJoining(false);
      return { error: msg };
    }
  }, []);

  const leaveMeeting = useCallback(async (studentId: string) => {
    if (!activeClass) return;
    const { error: err } = await attendanceService.recordLeave(activeClass.id, studentId);
    if (err) setError(err);
    setActiveClass(null);
    return { error: err };
  }, [activeClass]);

  const cancelClass = useCallback(async (id: string) => {
    const { error: err } = await liveClassService.updateStatus(id, 'cancelled');
    if (err) setError(err);
    await liveReminderService.deleteByLiveClass(id);
    return { error: err };
  }, []);

  const startClass = useCallback(async (id: string) => {
    const { error: err } = await liveClassService.updateStatus(id, 'live');
    if (err) setError(err);
    return { error: err };
  }, []);

  const endClass = useCallback(async (id: string) => {
    const { error: err } = await liveClassService.updateStatus(id, 'completed');
    if (err) setError(err);
    return { error: err };
  }, []);

  return {
    joining, error, activeClass,
    joinMeeting, leaveMeeting,
    cancelClass, startClass, endClass,
  };
}
