import { useEffect, useState } from 'react';
import { useUiStore } from '@/stores/useUiStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { PageView } from '@/features/page/components/PageView';
import { EmptyState } from '@/features/page/components/EmptyState';
import { Sidebar } from '@/features/sidebar/components/Sidebar';
import { SearchModal } from '@/features/search/components/SearchModal';
import { HubView } from '@/features/hub/components/HubView';
import { ProfileSettings } from '@/features/profile/components/ProfileSettings';

export const AppLayout = () => {
  const { isSidebarCollapsed, toggleSidebar, setSearchOpen, isHubActive, theme, fontPreset } = useUiStore();
  const { pages, activePageId, fetchPages } = useNotesStore();
  const { name: workspaceName, fetchWorkspace } = useWorkspaceStore();
  const [shouldSimulateError, setShouldSimulateError] = useState(false);

  useEffect(() => {
    fetchPages();
    fetchWorkspace();
  }, [fetchPages, fetchWorkspace]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    root.setAttribute('data-font', fontPreset);
  }, [theme, fontPreset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  if (shouldSimulateError) {
    throw new Error('Error simulado para probar el ErrorBoundary');
  }

  const activePage = activePageId ? pages[activePageId] : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      {/* Componente Sidebar */}
      <Sidebar />

      {/* Zona Contenido (main) */}
      <main className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
        <header className="h-14 border-b border-[var(--border-muted)] px-6 flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {workspaceName || 'Notion Local'}
            </span>
            {isHubActive ? (
              <span className="text-xs text-indigo-400 font-mono">
                / Inicio
              </span>
            ) : activePage ? (
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                / {activePage.title || 'Sin título'}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] border border-[var(--border-muted)] text-[var(--text-primary)] transition-colors cursor-pointer font-medium flex items-center gap-2"
            >
              <span>🔍 Buscar</span>
              <kbd className="px-1 py-0.5 text-[10px] bg-[var(--bg-surface)] rounded text-[var(--text-secondary)] font-mono border border-[var(--border-muted)]">
                Ctrl+K
              </kbd>
            </button>
            <button
              onClick={toggleSidebar}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-primary)] border border-[var(--border-muted)] transition-colors cursor-pointer font-medium"
            >
              {isSidebarCollapsed ? 'Expandir' : 'Colapsar'}
            </button>
            <button
              onClick={() => setShouldSimulateError(true)}
              className="px-3 py-1.5 rounded-lg text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer font-medium"
            >
              Probar Error Boundary
            </button>
          </div>
        </header>

        {isHubActive ? (
          <HubView />
        ) : activePage ? (
          <PageView page={activePage} />
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Modal de Búsqueda */}
      <SearchModal />

      {/* Modal de Ajustes de Perfil */}
      <ProfileSettings />
    </div>
  );
};
