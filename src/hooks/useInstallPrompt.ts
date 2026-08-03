import { useState, useEffect, useCallback } from 'react';
import { installPrompt } from '@/services/pwa';

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    installPrompt.init();
    setCanInstall(installPrompt.canInstall());
    const unsub = installPrompt.subscribe((can) => { setCanInstall(can); if (!can) setInstalled(true); });
    return unsub;
  }, []);

  const promptInstall = useCallback(async () => {
    const accepted = await installPrompt.promptInstall();
    if (accepted) { setInstalled(true); setCanInstall(false); }
    return accepted;
  }, []);

  return { canInstall, installed, promptInstall };
}
