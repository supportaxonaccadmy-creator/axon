import { useState, useEffect, useCallback } from 'react';
import { serviceWorker, versionManager, networkService, backgroundSync } from '@/services/pwa';

export function usePWA() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [online, setOnline] = useState(networkService.isOnline());
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    serviceWorker.register();
    versionManager.checkForUpdates();
    networkService.init();
    backgroundSync.init();
    const unsubSW = serviceWorker.subscribe(setUpdateAvailable);
    const unsubVersion = versionManager.subscribe(setUpdateAvailable);
    const unsubNetwork = networkService.subscribe((state) => setOnline(state.online));
    const unsubSync = backgroundSync.subscribe(() => setPendingSync(backgroundSync.pendingCount));
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
    return () => { unsubSW(); unsubVersion(); unsubNetwork(); unsubSync(); };
  }, []);

  const updateApp = useCallback(async () => {
    await serviceWorker.skipWaiting();
    window.location.reload();
  }, []);

  return { updateAvailable, isStandalone, online, pendingSync, updateApp };
}
