import { memo, useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowRight, Layers, BookOpen, FolderOpen, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useStudentSearch } from '@/hooks/useStudentSearch';
import type { EnhancedSearchResultItem } from '@/services/lms/enhancedSearchService';

const TYPE_ICONS: Record<string, { icon: typeof Layers; color: string; label: string }> = {
  batch: { icon: Layers, color: 'text-primary-600 bg-primary-50', label: 'Batch' },
  subject: { icon: BookOpen, color: 'text-accent-600 bg-accent-50', label: 'Subject' },
  chapter: { icon: FolderOpen, color: 'text-primary-600 bg-primary-50', label: 'Chapter' },
  class: { icon: PlayCircle, color: 'text-primary-600 bg-primary-50', label: 'Class' },
  video: { icon: PlayCircle, color: 'text-primary-600 bg-primary-50', label: 'Video' },
  pdf: { icon: FileText, color: 'text-accent-600 bg-accent-50', label: 'PDF' },
  mcq: { icon: HelpCircle, color: 'text-success-600 bg-success-50', label: 'MCQ' },
};

const TYPE_ROUTES: Record<string, (slug: string) => string> = {
  batch: (slug) => `/student/batches/${slug}`, subject: (slug) => `/student/subjects/${slug}`, chapter: (slug) => `/student/chapters/${slug}`,
  class: (slug) => `/student/classes/${slug}`, video: (slug) => `/student/classes/${slug}`, pdf: (slug) => `/student/classes/${slug}`, mcq: (slug) => `/student/mcq/${slug}`,
};

function GlobalSearchComponent() {
  const navigate = useNavigate();
  const { query, setQuery, results, loading, recentSearches, hasResults, clearRecent, saveSearch } = useStudentSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex >= 0 && results[activeIndex]) selectResult(results[activeIndex]!); else if (query.trim()) { saveSearch(query); setIsOpen(false); } }
    else if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
  };

  const selectResult = (item: EnhancedSearchResultItem) => {
    const route = TYPE_ROUTES[item.type]?.(item.slug) ?? '/student/batches';
    saveSearch(item.title); setQuery(''); setIsOpen(false); setActiveIndex(-1); navigate(route);
  };

  const handleRecentClick = (term: string) => { setQuery(term); inputRef.current?.focus(); };
  const showRecent = isOpen && !query.trim() && recentSearches.length > 0;
  const showResults = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input ref={inputRef} type="text" placeholder="Search batches, subjects, classes..." value={query} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setActiveIndex(-1); }} onFocus={() => setIsOpen(true)} onKeyDown={handleKeyDown} aria-label="Global search" aria-expanded={isOpen} aria-autocomplete="list" className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-9 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200" />
        {query && <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" aria-label="Clear search"><X className="h-4 w-4" /></button>}
      </div>
      {(showRecent || showResults) && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg animate-fade-in" role="listbox">
          {showRecent && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1.5"><span className="text-xs font-semibold text-neutral-500">Recent Searches</span><button onClick={clearRecent} className="text-xs text-primary-600 hover:underline">Clear</button></div>
              {recentSearches.map((term) => (<button key={term} onClick={() => handleRecentClick(term)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"><Clock className="h-3.5 w-3.5 text-neutral-400" />{term}</button>))}
            </div>
          )}
          {showResults && (
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && <div className="flex items-center justify-center py-6"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" /></div>}
              {!loading && !hasResults && <div className="py-6 text-center"><p className="text-sm text-neutral-500">No results found for "{query}"</p></div>}
              {!loading && hasResults && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500">{results.length} results</div>
                  {results.map((item, i) => {
                    const typeInfo = TYPE_ICONS[item.type] ?? TYPE_ICONS.batch!; const Icon = typeInfo.icon;
                    return (
                      <button key={`${item.type}-${item.id}`} onClick={() => selectResult(item)} onMouseEnter={() => setActiveIndex(i)} className={cn('flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors', activeIndex === i ? 'bg-primary-50' : 'hover:bg-neutral-50')} role="option" aria-selected={activeIndex === i}>
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', typeInfo.color)}><Icon className="h-4 w-4" strokeWidth={2} /></div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-neutral-800" dangerouslySetInnerHTML={{ __html: item.highlightedTitle }} />{item.snippet && <p className="truncate text-xs text-neutral-400" dangerouslySetInnerHTML={{ __html: item.snippet }} />}</div>
                        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">{typeInfo.label}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const GlobalSearch = memo(GlobalSearchComponent);
