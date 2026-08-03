import { useState, useEffect, useCallback } from 'react';
import { offlineStorage, offlineSync } from '@/services/pwa';

export function useOffline() {
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setQueueCount(offlineStorage.getQueue().length);
    const unsub = offlineSync.subscribe(() => setQueueCount(offlineStorage.getQueue().length));
    return unsub;
  }, []);

  const enqueueAction = useCallback((type: string, payload: Record<string, unknown>) => {
    offlineSync.enqueue(type, payload);
    setQueueCount(offlineStorage.getQueue().length);
  }, []);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    await offlineSync.sync();
    setQueueCount(offlineStorage.getQueue().length);
    setIsSyncing(false);
  }, []);

  const clearQueue = useCallback(() => {
    offlineStorage.clearQueue();
    setQueueCount(0);
  }, []);

  return { queueCount, isSyncing, enqueueAction, syncNow, clearQueue };
}
