import { useState, useEffect, useCallback } from 'react';
import { enhancedSearchService } from '@/services/lms/enhancedSearchService';
import type { EnhancedSearchResultItem } from '@/services/lms/enhancedSearchService';

const RECENT_SEARCHES_KEY = 'axon_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try { const stored = localStorage.getItem(RECENT_SEARCHES_KEY); return stored ? JSON.parse(stored) : []; } catch { return []; }
}

function saveRecentSearch(query: string): void {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((s) => s.toLowerCase() !== query.toLowerCase());
    filtered.unshift(query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch { /* ignore */ }
}

export interface UseStudentSearchResult {
  query: string; setQuery: (q: string) => void; results: EnhancedSearchResultItem[]; loading: boolean; error: string | null;
  recentSearches: string[]; hasResults: boolean; clearRecent: () => void; saveSearch: (q: string) => void;
}

export function useStudentSearch(): UseStudentSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EnhancedSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => { setRecentSearches(getRecentSearches()); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); setError(null); return; }
    const debounce = setTimeout(() => {
      setLoading(true);
      enhancedSearchService.search(query, { publishedOnly: true, highlight: true })
        .then((res) => { if (res.error) setError(res.error); else setError(null); setResults(res.data); })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Search failed'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const clearRecent = useCallback(() => { try { localStorage.removeItem(RECENT_SEARCHES_KEY); setRecentSearches([]); } catch { /* ignore */ } }, []);
  const saveSearch = useCallback((q: string) => { if (q.trim()) { saveRecentSearch(q.trim()); setRecentSearches(getRecentSearches()); } }, []);

  return { query, setQuery, results, loading, error, recentSearches, hasResults: results.length > 0, clearRecent, saveSearch };
}
