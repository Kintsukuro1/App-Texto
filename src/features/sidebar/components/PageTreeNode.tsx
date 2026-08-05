import { useState } from 'react';
import type { Page } from '@/types/page';
import { useNotesStore } from '@/stores/useNotesStore';
import { ContextMenu, type ContextMenuItem } from '@/components/common/ContextMenu';

interface PageTreeNodeProps {
  page: Page;
  allPages: Record<string, Page>;
  depth?: number;
  selectedTag?: string | null;
}

/** Comprobar si `candidateId` es ancestro o el mismo que `targetId` para prevenir ciclos */
function isDescendant(
  candidateId: string,
  targetId: string,
  allPages: Record<string, Page>
): boolean {
  if (candidateId === targetId) return true;

  const targetPage = allPages[targetId];
  if (!targetPage || !targetPage.parentId) return false;

  return isDescendant(candidateId, targetPage.parentId, allPages);
}

export const PageTreeNode = ({
  page,
  allPages,
  depth = 0,
  selectedTag,
}: PageTreeNodeProps) => {
  const { activePageId, setActivePageId, createSubPage, updatePage, deletePage, toggleFavorite } = useNotesStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // Menú contextual state
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // Encontrar hijas directas de esta página
  const children = Object.values(allPages).filter((p) => p.parentId === page.id);
  const hasChildren = children.length > 0;

  // Filtrado por tag si hay tag seleccionado
  if (selectedTag && !page.tags?.includes(selectedTag)) {
    const matchingChildren = children.filter((c) => c.tags?.includes(selectedTag));
    if (matchingChildren.length === 0) return null;
  }

  const isActive = activePageId === page.id;

  const handleAddSubPage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsExpanded(true);
    createSubPage(page.id, 'Nueva sub-página');
  };

  // --------------------------------------------------------------------------
  // Drag & Drop Handlers
  // --------------------------------------------------------------------------
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', page.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('text/plain');
    // Prevenir soltar sobre sí misma o sus descendientes
    if (draggedId && isDescendant(draggedId, page.id, allPages)) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

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
    if (!draggedId || draggedId === page.id) return;

    // Verificar que no sea un ciclo
    if (isDescendant(draggedId, page.id, allPages)) return;

    // Mover la página arrastrada como sub-página de esta
    updatePage(draggedId, { parentId: page.id });
    setIsExpanded(true);
  };

  // --------------------------------------------------------------------------
  // Context Menu Handler
  // --------------------------------------------------------------------------
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'add-subpage',
      label: 'Añadir sub-página',
      icon: '➕',
      action: () => handleAddSubPage(),
    },
    {
      id: 'toggle-fav',
      label: page.isFavorite ? 'Quitar de Favoritos' : 'Marcar como Favorita',
      icon: page.isFavorite ? '★' : '☆',
      action: () => toggleFavorite(page.id),
    },
    ...(page.parentId
      ? [
          {
            id: 'move-to-root',
            label: 'Mover a la raíz',
            icon: '⬆️',
            action: () => updatePage(page.id, { parentId: null }),
          },
        ]
      : []),
    {
      id: 'delete',
      label: 'Eliminar página',
      icon: '🗑️',
      danger: true,
      action: () => deletePage(page.id),
    },
  ];

  return (
    <div className="select-none">
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={handleContextMenu}
        onClick={() => setActivePageId(page.id)}
        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          isDragOver
            ? 'bg-indigo-600/30 border-2 border-dashed border-indigo-400 text-indigo-300 scale-[1.01]'
            : isActive
            ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent'
        }`}
        style={{ paddingLeft: `${Math.max(10, depth * 14 + 10)}px` }}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {/* Collapse/Expand Toggle Arrow */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-4 h-4 flex items-center justify-center rounded text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-transform"
            >
              <span className={`inline-block transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {/* Icon or default document icon */}
          <span className="text-sm shrink-0">{page.icon || '📄'}</span>

          {/* Title */}
          <span className="truncate">{page.title || 'Sin título'}</span>
        </div>

        {/* Hover action: Add Sub-page + */}
        <button
          onClick={handleAddSubPage}
          title="Añadir sub-página"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[11px] hover:bg-[var(--border-muted)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0"
        >
          ➕
        </button>
      </div>

      {/* Sub-pages tree (recursive) */}
      {hasChildren && isExpanded && (
        <div className="mt-0.5 space-y-0.5 border-l border-[var(--border-muted)]/40 ml-4 pl-0">
          {children.map((child) => (
            <PageTreeNode
              key={child.id}
              page={child}
              allPages={allPages}
              depth={depth + 1}
              selectedTag={selectedTag}
            />
          ))}
        </div>
      )}

      {/* Menú Contextual Flotante */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        items={contextMenuItems}
      />
    </div>
  );
};
