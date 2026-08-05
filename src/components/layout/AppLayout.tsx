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
import { SharePanel } from '@/features/share/components/SharePanel';
import { requestNotificationPermission } from '@/core/notifications';

export const AppLayout = () => {
  const { isSidebarCollapsed, toggleSidebar, setSearchOpen, isHubActive, theme, fontPreset } = useUiStore();
  const { pages, activePageId, fetchPages } = useNotesStore();
  const { name: workspaceName, fetchWorkspace } = useWorkspaceStore();
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    fetchPages();
    fetchWorkspace();
    requestNotificationPermission();
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

    const handleOpenShare = () => setIsShareOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-share-panel', handleOpenShare);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-share-panel', handleOpenShare);
    };
  }, [setSearchOpen]);


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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] border border-[var(--border-muted)] text-[var(--text-primary)] transition-colors cursor-pointer font-medium flex items-center gap-2"
            >
              <span>🔍 Buscar</span>
              <kbd className="px-1 py-0.5 text-[10px] bg-[var(--bg-surface)] rounded text-[var(--text-secondary)] font-mono border border-[var(--border-muted)]">
                Ctrl+K
              </kbd>
            </button>
            {/* Botón Compartir / Invitar */}
            <button
              onClick={() => setIsShareOpen(true)}
              title="Compartir en red local e Invitar"
              className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 transition-colors cursor-pointer font-medium flex items-center gap-1.5 shadow-sm"
            >
              <span>📡</span>
              <span>Compartir / Invitar</span>
            </button>
            <button
              onClick={toggleSidebar}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-primary)] border border-[var(--border-muted)] transition-colors cursor-pointer font-medium"
            >
              {isSidebarCollapsed ? 'Expandir' : 'Colapsar'}
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

      {/* Panel de Compartir en LAN */}
      <SharePanel isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
};
