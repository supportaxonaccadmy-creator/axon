export interface SearchToken {
  value: string;
  type: 'word' | 'phrase' | 'operator';
}

export interface SearchQuery {
  raw: string;
  tokens: SearchToken[];
  terms: string[];
  fields: string[];
  fuzzy: boolean;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  score: number;
  highlights: Record<string, string>;
}

export interface SearchHighlightConfig {
  preTag: string;
  postTag: string;
  maxFragments: number;
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'ilike' | 'in' | 'gt' | 'lt' | 'gte' | 'lte';
  value: unknown;
}
