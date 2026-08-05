import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useNotesStore } from '@/stores/useNotesStore';
import { useUiStore } from '@/stores/useUiStore';
import type { Page } from '@/types/page';

export const SearchModal = () => {
  const { isSearchOpen, setSearchOpen } = useUiStore();
  const { pages, setActivePageId } = useNotesStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Convert pages dictionary to array
  const pagesList = useMemo(() => Object.values(pages), [pages]);

  // Configure Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(pagesList, {
      keys: ['title', 'content'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [pagesList]);

  // Perform search
  const results = useMemo(() => {
    if (!query.trim()) {
      return pagesList.slice(0, 10).map((item) => ({ item }));
    }
    return fuse.search(query);
  }, [fuse, query, pagesList]);

  // Reset state & auto-focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelectPage = (pageId: string) => {
    setActivePageId(pageId);
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectPage(results[selectedIndex].item.id);
      }
    }
  };

  // Extract brief content preview text
  const getContentSnippet = (content: string) => {
    if (!content) return '';
    // Strip common block syntax or HTML if present for clean display
    const cleaned = content.replace(/<[^>]*>/g, ' ').replace(/[{}[\]"']/g, ' ');
    return cleaned.length > 90 ? cleaned.slice(0, 90) + '...' : cleaned;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-[var(--border-muted)] flex items-center gap-3 bg-[var(--bg-surface)]">
          <span className="text-[var(--text-secondary)] text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por título o contenido..."
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
            >
              ✕
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-secondary)] rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[var(--border-muted)]">
          {results.length > 0 ? (
            results.map((res, index) => {
              const page: Page = res.item;
              const isSelected = index === selectedIndex;
              const snippet = getContentSnippet(page.content);

              return (
                <div
                  key={page.id}
                  onClick={() => handleSelectPage(page.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl transition-all duration-150 cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-600/25 border border-indigo-500/30'
                      : 'hover:bg-[var(--bg-primary)] border border-transparent'
                  }`}
                >
                  <span className="text-xl shrink-0 pt-0.5">
                    {page.icon ? page.icon : '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {page.title || 'Sin título'}
                      </span>
                      {page.isFavorite && (
                        <span className="text-xs text-amber-400">★</span>
                      )}
                    </div>
                    {snippet && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 font-normal leading-relaxed">
                        {snippet}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[var(--text-secondary)] text-sm">
              No se encontraron notas que coincidan con &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-[var(--bg-primary)] border-t border-[var(--border-muted)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded text-[var(--text-secondary)]">
                ↑
              </kbd>{' '}
              <kbd className="px-1 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded text-[var(--text-secondary)]">
                ↓
              </kbd>{' '}
              Navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded text-[var(--text-secondary)]">
                ↵
              </kbd>{' '}
              Abrir
            </span>
          </div>
          <span>Fuse.js search</span>
        </div>
      </div>
    </div>
  );
};
