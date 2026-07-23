import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean },
): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === key &&
        (options?.ctrlKey ? e.ctrlKey : true) &&
        (options?.metaKey ? e.metaKey : true) &&
        (options?.shiftKey ? e.shiftKey : true) &&
        (options?.altKey ? e.altKey : true)
      ) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback, options?.ctrlKey, options?.metaKey, options?.shiftKey, options?.altKey]);
}
