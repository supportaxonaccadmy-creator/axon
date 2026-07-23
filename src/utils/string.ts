export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function truncate(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

export function camelCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^./, (char: string) => char.toLowerCase());
}

export function snakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
    .replace(/^_|_$/g, '');
}

export function kebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '');
}

export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

export function repeat(text: string, count: number): string {
  return text.repeat(count);
}

export function padStart(text: string, length: number, pad: string = ' '): string {
  return text.padStart(length, pad);
}

export function padEnd(text: string, length: number, pad: string = ' '): string {
  return text.padEnd(length, pad);
}

export function reverse(text: string): string {
  return text.split('').reverse().join('');
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
