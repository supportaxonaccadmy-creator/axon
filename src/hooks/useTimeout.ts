import { useEffect, useRef } from 'react';

export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallbackRef = useRef(callback);

  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallbackRef.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}
