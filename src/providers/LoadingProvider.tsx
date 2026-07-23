import { useCallback, useState, type ReactNode } from 'react';
import { LoadingContext } from '@/contexts/LoadingContext';
import type { LoadingContextValue } from '@/types/providers';

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const startLoading = useCallback((message?: string) => {
    setIsLoading(true);
    setLoadingMessage(message ?? null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(null);
  }, []);

  const withLoading = useCallback(
    <T,>(promise: Promise<T>, message?: string): Promise<T> => {
      startLoading(message);
      return promise.finally(() => stopLoading());
    },
    [startLoading, stopLoading],
  );

  const value: LoadingContextValue = {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}
