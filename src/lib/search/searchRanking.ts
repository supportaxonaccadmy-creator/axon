import type { SearchResult } from '@/types/search';

export function calculateScore(item: { title: string; description?: string | null }, terms: string[]): number {
  let score = 0;
  const titleLower = item.title.toLowerCase();
  const descLower = (item.description ?? '').toLowerCase();
  for (const term of terms) {
    if (titleLower.includes(term)) score += 10;
    if (titleLower.startsWith(term)) score += 5;
    if (descLower.includes(term)) score += 3;
    if (descLower.startsWith(term)) score += 1;
  }
  return score;
}

export function rankResults<T extends { title: string; description?: string | null; id: string }>(items: T[], terms: string[]): SearchResult[] {
  return items.map((item) => ({ id: item.id, type: '', title: item.title, score: calculateScore(item, terms), highlights: {} })).sort((a, b) => b.score - a.score);
}

export function sortByScore<T extends { score: number }>(items: T[]): T[] { return [...items].sort((a, b) => b.score - a.score); }
export function filterByMinScore<T extends { score: number }>(items: T[], minScore: number = 1): T[] { return items.filter((i) => i.score >= minScore); }
