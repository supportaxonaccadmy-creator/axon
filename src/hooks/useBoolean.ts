import { useCallback } from 'react';
import { useToggle } from './useToggle';

export function useBoolean(initial: boolean = false): {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
  setValue: (v: boolean) => void;
} {
  const [value, toggle, setValue] = useToggle(initial);

  const setTrue = useCallback(() => setValue(true), [setValue]);
  const setFalse = useCallback(() => setValue(false), [setValue]);

  return { value, setTrue, setFalse, toggle, setValue };
}
