import { useCallback, useState, type ReactNode } from 'react';
import { AppContext } from '@/contexts/AppContext';
import type { AppContextValue } from '@/types/providers';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (isReady || isInitializing) return;
    setIsInitializing(true);
    setError(null);
    try {
      await Promise.resolve();
      setIsReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Initialization failed');
    } finally {
      setIsInitializing(false);
    }
  }, [isReady, isInitializing]);

  const reset = useCallback(() => {
    setIsReady(false);
    setIsInitializing(false);
    setError(null);
  }, []);

  const value: AppContextValue = {
    isReady,
    isInitializing,
    error,
    initialize,
    reset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
