/**
 * General-purpose helper utilities.
 */

/**
 * Generate a unique ID with an optional prefix.
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Check if a value is defined (not null or undefined).
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Delay execution for the given milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max values.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Safely access a nested object property by key path.
 */
export function getByPath<T>(obj: unknown, path: string): T | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current as T | undefined;
}

/**
 * Remove duplicate items from an array by a key function.
 */
export function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
