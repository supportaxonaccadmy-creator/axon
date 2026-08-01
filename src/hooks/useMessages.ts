import { useState, useCallback } from 'react';
import { notificationQueue } from '@/services/notification';
import type { BroadcastInput, BroadcastTarget, NotificationPriority } from '@/services/notification';

export function useMessages() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ recipientCount: number; error: string | null } | null>(null);

  const broadcast = useCallback(async (adminId: string, input: Omit<BroadcastInput, 'target'> & { target: BroadcastTarget }) => {
    setSending(true);
    setError(null);
    const { data, error: err, recipientCount } = await notificationQueue.broadcast(adminId, input);
    if (err) {
      setError(err);
      setLastResult({ recipientCount: 0, error: err });
    } else {
      setLastResult({ recipientCount, error: null });
    }
    setSending(false);
    return { data, error: err, recipientCount };
  }, []);

  const sendToAll = useCallback(async (adminId: string, title: string, message: string, priority?: NotificationPriority) => {
    const input: Omit<BroadcastInput, 'target'> & { target: BroadcastTarget } = {
      title, message, target: { type: 'all_students' },
    };
    if (priority) input.priority = priority;
    return broadcast(adminId, input);
  }, [broadcast]);

  const sendToBatch = useCallback(async (adminId: string, batchId: string, title: string, message: string, priority?: NotificationPriority) => {
    const input: Omit<BroadcastInput, 'target'> & { target: BroadcastTarget } = {
      title, message, target: { type: 'batch', batchId },
    };
    if (priority) input.priority = priority;
    return broadcast(adminId, input);
  }, [broadcast]);

  const sendToIndividuals = useCallback(async (adminId: string, recipientIds: string[], title: string, message: string, priority?: NotificationPriority) => {
    const input: Omit<BroadcastInput, 'target'> & { target: BroadcastTarget } = {
      title, message, target: { type: 'individual', recipientIds },
    };
    if (priority) input.priority = priority;
    return broadcast(adminId, input);
  }, [broadcast]);

  return {
    sending, error, lastResult,
    broadcast, sendToAll, sendToBatch, sendToIndividuals,
  };
}
