export function toBoolean(value: string | number | boolean | null | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  return false;
}

export function toggle(value: boolean): boolean {
  return !value;
}

export function allTrue(values: boolean[]): boolean {
  return values.every(Boolean);
}

export function anyTrue(values: boolean[]): boolean {
  return values.some(Boolean);
}

export function noneTrue(values: boolean[]): boolean {
  return !values.some(Boolean);
}
