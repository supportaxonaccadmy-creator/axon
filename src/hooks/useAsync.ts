import { useCallback, useEffect, useState } from 'react';

export function useAsync<T>(asyncFn: () => Promise<T>, deps: unknown[] = []): {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
} {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);

    asyncFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchIndex, ...deps]);

  return { data, loading, error, refetch };
}
