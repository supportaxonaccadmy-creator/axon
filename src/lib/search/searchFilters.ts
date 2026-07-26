import type { SearchFilter } from '@/types/search';

export function buildSearchFilters(filters: { field: string; value: unknown; operator?: SearchFilter['operator'] }[]): SearchFilter[] {
  return filters.map((f) => ({ field: f.field, operator: f.operator ?? 'eq', value: f.value }));
}

export function applySearchFilters<T extends Record<string, unknown>>(items: T[], filters: SearchFilter[]): T[] {
  return items.filter((item) => filters.every((f) => {
    const value = item[f.field];
    switch (f.operator) {
      case 'eq': return value === f.value;
      case 'neq': return value !== f.value;
      case 'gt': return typeof value === 'number' && typeof f.value === 'number' && value > f.value;
      case 'lt': return typeof value === 'number' && typeof f.value === 'number' && value < f.value;
      case 'gte': return typeof value === 'number' && typeof f.value === 'number' && value >= f.value;
      case 'lte': return typeof value === 'number' && typeof f.value === 'number' && value <= f.value;
      case 'in': return Array.isArray(f.value) && f.value.includes(value);
      case 'ilike': return typeof value === 'string' && typeof f.value === 'string' && value.toLowerCase().includes(f.value.toLowerCase());
      default: return true;
    }
  }));
}

export function multiFieldSearch<T extends Record<string, unknown>>(items: T[], terms: string[], fields: string[]): T[] {
  return items.filter((item) => terms.some((term) => {
    const lowerTerm = term.toLowerCase();
    return fields.some((field) => { const value = item[field]; return typeof value === 'string' && value.toLowerCase().includes(lowerTerm); });
  }));
}
