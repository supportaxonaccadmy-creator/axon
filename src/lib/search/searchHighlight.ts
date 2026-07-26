import type { SearchHighlightConfig } from '@/types/search';

const DEFAULT_CONFIG: SearchHighlightConfig = { preTag: '<mark>', postTag: '</mark>', maxFragments: 3 };

export function highlightText(text: string, terms: string[], config?: Partial<SearchHighlightConfig>): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let result = text;
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    result = result.replace(regex, `${cfg.preTag}$1${cfg.postTag}`);
  }
  return result;
}

export function highlightField(text: string | null, terms: string[], config?: Partial<SearchHighlightConfig>): string {
  if (!text) return '';
  return highlightText(text, terms, config);
}

export function highlightMultiple(fields: Record<string, string | null>, terms: string[], config?: Partial<SearchHighlightConfig>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) { result[key] = highlightField(value, terms, config); }
  return result;
}

export function extractSnippet(text: string, terms: string[], maxChars: number = 100): string {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  const firstTerm = terms.find((t) => lowerText.includes(t.toLowerCase()));
  if (!firstTerm) return text.slice(0, maxChars);
  const index = lowerText.indexOf(firstTerm.toLowerCase());
  const start = Math.max(0, index - Math.floor(maxChars / 2));
  const end = Math.min(text.length, start + maxChars);
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}
