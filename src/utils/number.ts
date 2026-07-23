export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function percent(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%';
  return `${round((value / total) * 100, decimals)}%`;
}

export function isEven(value: number): boolean {
  return value % 2 === 0;
}

export function isOdd(value: number): boolean {
  return value % 2 !== 0;
}

export function isPositive(value: number): boolean {
  return value > 0;
}

export function isNegative(value: number): boolean {
  return value < 0;
}

export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

export function isFloat(value: number): boolean {
  return !Number.isInteger(value);
}

export function toFixed(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
