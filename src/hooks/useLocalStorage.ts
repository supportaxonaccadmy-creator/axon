import { useCallback, useState } from 'react';
import { getStorageItem, setStorageItem } from '@/utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => getStorageItem(key, initialValue));

  const setValue = useCallback(
    (value: T) => {
      setStorageItem(key, value);
      setStoredValue(value);
    },
    [key],
  );

  return [storedValue, setValue];
}
