export function formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'iso') return d.toISOString();
  if (format === 'long') return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function toUTC(date: Date | string): Date { const d = typeof date === 'string' ? new Date(date) : date; return new Date(d.toISOString()); }
export function toIST(date: Date | string): Date { const d = typeof date === 'string' ? new Date(date) : date; return new Date(d.getTime() + 5.5 * 60 * 60 * 1000); }
export function formatIST(date: Date | string): string { const d = toIST(date); return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

export function calculateAge(birthDate: Date | string): number {
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export function startOfDay(date: Date | string): Date { const d = typeof date === 'string' ? new Date(date) : new Date(date); d.setHours(0, 0, 0, 0); return d; }
export function endOfDay(date: Date | string): Date { const d = typeof date === 'string' ? new Date(date) : new Date(date); d.setHours(23, 59, 59, 999); return d; }
export function isSameDay(a: Date | string, b: Date | string): boolean { const da = typeof a === 'string' ? new Date(a) : a; const db = typeof b === 'string' ? new Date(b) : b; return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate(); }
export function addDays(date: Date | string, days: number): Date { const d = typeof date === 'string' ? new Date(date) : new Date(date); d.setDate(d.getDate() + days); return d; }
