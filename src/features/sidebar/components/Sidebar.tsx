import { useState } from 'react';
import { useNotesStore } from '@/stores/useNotesStore';
import { useUiStore } from '@/stores/useUiStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { PageTreeNode } from '@/features/sidebar/components/PageTreeNode';
import { WorkspaceSelector } from '@/features/sidebar/components/WorkspaceSelector';
import { PageIcon } from '@/components/common/PageIcon';
import { vocabulary } from '@/core/vocabulary';
import type { Page } from '@/types/page';

const RootDropZone = () => {
  const { updatePage } = useNotesStore();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId) {
      updatePage(draggedId, { parentId: null });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`mt-2 p-2 rounded-xl border-2 border-dashed text-[11px] text-center transition-all ${
        isDragOver
          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 font-medium scale-[1.02]'
          : 'border-transparent text-transparent hover:border-[var(--border-muted)] hover:text-[var(--text-muted)]'
      }`}
    >
      {isDragOver ? '📥 Soltar para mover a nivel raíz' : 'Mover a nivel raíz'}
    </div>
  );
};

export const Sidebar = () => {
  const { pages, activePageId, recentPageIds, setActivePageId, createPage } = useNotesStore();
  const { isSidebarCollapsed, toggleSidebar, setSearchOpen, isHubActive, setHubActive, setProfileOpen } = useUiStore();
  const { user, logout } = useAuthStore();
  const { activeWorkspaceId } = useWorkspaceStore();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allPagesList = Object.values(pages).filter(
    (p) => !p.workspaceId || p.workspaceId === activeWorkspaceId
  );

  // Obtener todas las etiquetas únicas presentes en las páginas
  const allTags = Array.from(
    new Set(allPagesList.flatMap((p) => p.tags || []))
  ).filter(Boolean);

  // 1. Favoritos
  const favorites = allPagesList.filter((page) => page.isFavorite);

  // 2. Recientes
  const recentPages = recentPageIds
    .map((id) => pages[id])
    .filter((page): page is Page => Boolean(page));

  // 3. Páginas Raíz (las que no tienen parentId)
  const rootPages = allPagesList.filter((page) => !page.parentId);

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
        <PageIcon icon={page.icon} className="w-4 h-4 rounded object-cover shrink-0" fallback="📄" />
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
      <div className="flex flex-col gap-3 min-h-0 flex-1">
        {/* Header bar: Workspace Selector & Collapse button */}
        <div className="flex items-center justify-between px-1 pt-1">
          {!isSidebarCollapsed && <WorkspaceSelector />}
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

        {/* Tag Filters (if tags exist) */}
        {!isSidebarCollapsed && allTags.length > 0 && (
          <div className="px-1 pt-1 space-y-1">
            <div className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase flex items-center justify-between">
              <span>🏷️ Etiquetas</span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[9px] text-indigo-400 hover:underline cursor-pointer lowercase"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer ${
                    selectedTag === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-muted)]'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sections List (Scrollable) */}
        {!isSidebarCollapsed && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-1 scrollbar-thin">
            {/* Sección 1: Favoritos */}
            {favorites.length > 0 && !selectedTag && (
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
            {recentPages.length > 0 && !selectedTag && (
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

            {/* Sección 3: Árbol de Notas (Jerarquía) */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase flex items-center gap-1">
                <span>📚</span>
                <span>{selectedTag ? `Filtrado por #${selectedTag}` : 'Todas las notas'}</span>
              </div>
              {rootPages.length > 0 ? (
                <div className="space-y-0.5">
                  {rootPages.map((page) => (
                    <PageTreeNode
                      key={page.id}
                      page={page}
                      allPages={pages}
                      selectedTag={selectedTag}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-2 py-1 text-xs text-[var(--text-secondary)] italic">
                  Sin notas
                </div>
              )}

              {/* Zona de caída para mover páginas al nivel raíz */}
              <RootDropZone />
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
