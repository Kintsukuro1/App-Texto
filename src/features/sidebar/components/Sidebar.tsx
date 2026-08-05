import { useNotesStore } from '@/stores/useNotesStore';
import { useUiStore } from '@/stores/useUiStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { vocabulary } from '@/core/vocabulary';
import type { Page } from '@/types/page';

export const Sidebar = () => {
  const { pages, activePageId, recentPageIds, setActivePageId, createPage } = useNotesStore();
  const { isSidebarCollapsed, toggleSidebar, setSearchOpen, isHubActive, setHubActive, setProfileOpen } = useUiStore();
  const { user, logout } = useAuthStore();
  const { name: workspaceName } = useWorkspaceStore();

  const allPagesList = Object.values(pages);

  // 1. Favoritos
  const favorites = allPagesList.filter((page) => page.isFavorite);

  // 2. Recientes (resolved from recentPageIds against pages map)
  const recentPages = recentPageIds
    .map((id) => pages[id])
    .filter((page): page is Page => Boolean(page));

  // 3. Todas las notas (el resto: páginas que no son favoritas)
  const otherPages = allPagesList.filter((page) => !page.isFavorite);

  const renderPageItem = (page: Page) => {
    const isActive = !isHubActive && page.id === activePageId;
    return (
      <button
        key={page.id}
        onClick={() => setActivePageId(page.id)}
        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer group truncate ${
          isActive
            ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
        }`}
        title={page.title || 'Sin título'}
      >
        <span className="shrink-0 text-sm">
          {page.icon ? page.icon : '📄'}
        </span>
        <span className="truncate flex-1">
          {page.title || 'Sin título'}
        </span>
      </button>
    );
  };

  return (
    <aside
      className={`bg-[var(--bg-surface)] border-r border-[var(--border-muted)] transition-all duration-300 flex flex-col justify-between p-3 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & Navigation Actions */}
      <div className="flex flex-col gap-3 min-h-0">
        {/* Header bar: Workspace Logo & Collapse button */}
        <div className="flex items-center justify-between px-1 pt-1">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg shrink-0">✨</span>
              <span className="font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent truncate">
                {workspaceName || 'Notion Local'}
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-muted)] transition-colors cursor-pointer text-xs font-mono ml-auto"
            title={isSidebarCollapsed ? 'Expandir Sidebar' : 'Colapsar Sidebar'}
          >
            {isSidebarCollapsed ? '➡️' : '⬅️'}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="space-y-2">
            {/* "Inicio" Button */}
            <button
              onClick={() => setHubActive(true)}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                isHubActive
                  ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] border border-transparent'
              }`}
              title="Inicio (Hub)"
            >
              <span className="shrink-0 text-sm">🏠</span>
              <span>Inicio</span>
            </button>

            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full py-1.5 px-2.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] border border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition-all duration-150 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors">
                  🔍
                </span>
                <span>Buscar...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded text-[var(--text-secondary)]">
                Ctrl K
              </kbd>
            </button>

            {/* "+ Nueva nota" Button */}
            <button
              onClick={() => createPage()}
              className="w-full py-1.5 px-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 text-xs font-medium transition-all duration-150 cursor-pointer flex items-center justify-between shadow-sm"
            >
              <span>+ Nueva {vocabulary.page}</span>
              <span className="text-[10px] text-indigo-400/70">+</span>
            </button>
          </div>
        )}

        {/* Collapsed quick buttons */}
        {isSidebarCollapsed && (
          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={() => setHubActive(true)}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                isHubActive
                  ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/30'
                  : 'bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-primary)]'
              }`}
              title="Inicio (Hub)"
            >
              🏠
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-primary)] transition-colors cursor-pointer text-xs"
              title="Buscar (Ctrl+K)"
            >
              🔍
            </button>
            <button
              onClick={() => createPage()}
              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 transition-colors cursor-pointer text-xs"
              title={`Nueva ${vocabulary.page}`}
            >
              ➕
            </button>
          </div>
        )}

        {/* Sections List (Scrollable) */}
        {!isSidebarCollapsed && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-1 scrollbar-thin">
            {/* Sección 1: Favoritos */}
            {favorites.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase flex items-center gap-1">
                  <span>⭐</span>
                  <span>Favoritos</span>
                </div>
                <div className="space-y-0.5">
                  {favorites.map(renderPageItem)}
                </div>
              </div>
            )}

            {/* Sección 2: Recientes */}
            {recentPages.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase flex items-center gap-1">
                  <span>🕒</span>
                  <span>Recientes</span>
                </div>
                <div className="space-y-0.5">
                  {recentPages.map(renderPageItem)}
                </div>
              </div>
            )}

            {/* Sección 3: Todas las notas */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase flex items-center gap-1">
                <span>📚</span>
                <span>Todas las notas</span>
              </div>
              {otherPages.length > 0 ? (
                <div className="space-y-0.5">
                  {otherPages.map(renderPageItem)}
                </div>
              ) : (
                <div className="px-2 py-1 text-xs text-[var(--text-secondary)] italic">
                  {favorites.length > 0 ? 'Todas están en favoritos' : 'Sin notas'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: User Profile (Clickable for ProfileSettings) */}
      {user && (
        <div className="border-t border-[var(--border-muted)] pt-2.5 mt-2 flex items-center justify-between">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 overflow-hidden hover:bg-[var(--bg-primary)] p-1.5 rounded-xl transition-colors cursor-pointer flex-1 text-left"
            title="Editar perfil y ajustes"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
              style={{ backgroundColor: user.color }}
            >
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                {user.username}
              </span>
            )}
          </button>
          {!isSidebarCollapsed && (
            <button
              onClick={logout}
              className="text-xs text-[var(--text-secondary)] hover:text-rose-400 transition-colors cursor-pointer px-1.5 py-1 rounded hover:bg-rose-500/10 ml-1"
              title="Cerrar sesión"
            >
              Salir
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
