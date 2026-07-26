import type { SearchToken, SearchQuery } from '@/types/search';

export function tokenize(query: string): SearchToken[] {
  const tokens: SearchToken[] = [];
  const phraseRegex = /"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = phraseRegex.exec(query)) !== null) { tokens.push({ value: match[1] ?? '', type: 'phrase' }); }
  const remaining = query.replace(phraseRegex, ' ');
  const words = remaining.split(/\s+/).filter((w) => w.length > 0);
  for (const word of words) {
    if (word === 'AND' || word === 'OR' || word === 'NOT') tokens.push({ value: word, type: 'operator' });
    else tokens.push({ value: word, type: 'word' });
  }
  return tokens;
}

export function extractTerms(tokens: SearchToken[]): string[] {
  return tokens.filter((t) => t.type !== 'operator').map((t) => t.value.toLowerCase());
}

export function buildSearchQuery(raw: string, fields: string[], fuzzy: boolean = false): SearchQuery {
  const tokens = tokenize(raw);
  const terms = extractTerms(tokens);
  return { raw, tokens, terms, fields, fuzzy };
}

export function prepareFuzzyTerm(term: string): string { return `%${term.toLowerCase()}%`; }
export function normalizeSearchQuery(query: string): string { return query.trim().replace(/\s+/g, ' ').toLowerCase(); }
