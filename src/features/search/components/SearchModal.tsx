import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useNotesStore } from '@/stores/useNotesStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageIcon } from '@/components/common/PageIcon';
import type { Page } from '@/types/page';

interface CommandAction {
  id: string;
  icon: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

export const SearchModal = () => {
  const {
    isSearchOpen,
    setSearchOpen,
    theme,
    setTheme,
    setHubActive,
    setProfileOpen,
  } = useUiStore();
  const { pages, activePageId, setActivePageId, createPage, deletePage } = useNotesStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Lista de acciones del sistema disponibles en la Paleta de Comandos
  const actions: CommandAction[] = useMemo(
    () => [
      {
        id: 'new-page',
        icon: '➕',
        label: 'Crear nueva nota',
        shortcut: 'Ctrl+N',
        action: () => {
          createPage();
          setSearchOpen(false);
        },
      },
      {
        id: 'toggle-theme',
        icon: theme === 'dark' ? '☀️' : '🌙',
        label: `Cambiar tema a ${theme === 'dark' ? 'Claro' : 'Oscuro'}`,
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          setSearchOpen(false);
        },
      },
      {
        id: 'go-home',
        icon: '🏠',
        label: 'Ir al Inicio (Hub)',
        action: () => {
          setHubActive(true);
          setSearchOpen(false);
        },
      },
      {
        id: 'open-profile',
        icon: '👤',
        label: 'Abrir Ajustes de Perfil',
        action: () => {
          setProfileOpen(true);
          setSearchOpen(false);
        },
      },
      ...(activePageId
        ? [
            {
              id: 'delete-current',
              icon: '🗑️',
              label: 'Eliminar nota actual',
              action: () => {
                deletePage(activePageId);
                setSearchOpen(false);
              },
            },
          ]
        : []),
    ],
    [theme, activePageId, createPage, deletePage, setSearchOpen, setTheme, setHubActive, setProfileOpen]
  );

  // Filtered actions based on query
  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [actions, query]);

  // Pages search with Fuse.js
  const pagesList = useMemo(() => Object.values(pages), [pages]);

  const fuse = useMemo(() => {
    return new Fuse(pagesList, {
      keys: ['title', 'content', 'tags'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [pagesList]);

  const pageResults = useMemo(() => {
    if (!query.trim()) {
      return pagesList.slice(0, 8).map((item) => ({ item }));
    }
    return fuse.search(query);
  }, [fuse, query, pagesList]);

  // Combined selectable items list (Actions + Pages)
  const totalItemsCount = filteredActions.length + pageResults.length;

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isSearchOpen) return null;

  const executeSelectedItem = (index: number) => {
    if (index < filteredActions.length) {
      filteredActions[index].action();
    } else {
      const pageIndex = index - filteredActions.length;
      if (pageResults[pageIndex]) {
        setActivePageId(pageResults[pageIndex].item.id);
        setSearchOpen(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalItemsCount > 0) {
        setSelectedIndex((prev) => (prev + 1) % totalItemsCount);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalItemsCount > 0) {
        setSelectedIndex((prev) => (prev - 1 + totalItemsCount) % totalItemsCount);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSelectedItem(selectedIndex);
    }
  };

  const getContentSnippet = (content: string) => {
    if (!content) return '';
    const cleaned = content.replace(/<[^>]*>/g, ' ').replace(/[{}[\]"']/g, ' ');
    return cleaned.length > 80 ? cleaned.slice(0, 80) + '...' : cleaned;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Input */}
        <div className="p-4 border-b border-[var(--border-muted)] flex items-center gap-3 bg-[var(--bg-surface)]">
          <span className="text-indigo-400 text-lg">⚡</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar nota o ejecutar comando (ej. tema, nueva, inicio)..."
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

        {/* Results / Commands List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin">
          {/* Section 1: Command Actions */}
          {filteredActions.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase">
                ⚡ Acciones Rápidas
              </div>
              {filteredActions.map((act, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={act.id}
                    onClick={() => act.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-medium ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{act.icon}</span>
                      <span>{act.label}</span>
                    </div>
                    {act.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-black/20 rounded opacity-80">
                        {act.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Section 2: Notes / Pages Search */}
          {pageResults.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase">
                📚 Notas ({pageResults.length})
              </div>
              {pageResults.map((res, idx) => {
                const globalIndex = filteredActions.length + idx;
                const page: Page = res.item;
                const isSelected = globalIndex === selectedIndex;
                const snippet = getContentSnippet(page.content);

                return (
                  <div
                    key={page.id}
                    onClick={() => {
                      setActivePageId(page.id);
                      setSearchOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/25 border border-indigo-500/40 text-[var(--text-primary)]'
                        : 'hover:bg-[var(--bg-hover)] border border-transparent text-[var(--text-primary)]'
                    }`}
                  >
                    <PageIcon icon={page.icon} className="w-5 h-5 rounded object-cover shrink-0 mt-0.5" fallback="📄" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold truncate">
                          {page.title || 'Sin título'}
                        </span>
                        {page.isFavorite && (
                          <span className="text-xs text-amber-400">★</span>
                        )}
                      </div>
                      {snippet && (
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1 font-normal leading-relaxed">
                          {snippet}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalItemsCount === 0 && (
            <div className="p-8 text-center text-[var(--text-secondary)] text-sm">
              No se encontraron comandos ni notas que coincidan con &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-[var(--bg-primary)] border-t border-[var(--border-muted)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded">
                ↑
              </kbd>{' '}
              <kbd className="px-1 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded">
                ↓
              </kbd>{' '}
              Navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded">
                ↵
              </kbd>{' '}
              Ejecutar / Abrir
            </span>
          </div>
          <span>Paleta de Comandos Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};
