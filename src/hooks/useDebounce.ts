import { useEffect, useState } from 'react';
import { debounce } from '@/utils/helpers';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = debounce((v: T) => setDebouncedValue(v), delay);
    handler(value);
    return () => {
      // debounce has no cancel in current impl; timer self-clears
    };
  }, [value, delay]);

  return debouncedValue;
}
