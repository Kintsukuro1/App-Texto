import { useState } from 'react';
import type { Page } from '@/types/page';
import { useNotesStore } from '@/stores/useNotesStore';

interface PageTreeNodeProps {
  page: Page;
  allPages: Record<string, Page>;
  depth?: number;
  selectedTag?: string | null;
}

export const PageTreeNode = ({
  page,
  allPages,
  depth = 0,
  selectedTag,
}: PageTreeNodeProps) => {
  const { activePageId, setActivePageId, createSubPage } = useNotesStore();
  const [isExpanded, setIsExpanded] = useState(true);

  // Encontrar hijas directas de esta página
  const children = Object.values(allPages).filter((p) => p.parentId === page.id);
  const hasChildren = children.length > 0;

  // Filtrado por tag si hay tag seleccionado
  if (selectedTag && !page.tags?.includes(selectedTag)) {
    // Si la página no coincide pero tiene hijas que coincidan, renderizar hijas
    const matchingChildren = children.filter((c) => c.tags?.includes(selectedTag));
    if (matchingChildren.length === 0) return null;
  }

  const isActive = activePageId === page.id;

  const handleAddSubPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
    createSubPage(page.id, 'Nueva sub-página');
  };

  return (
    <div className="select-none">
      <div
        onClick={() => setActivePageId(page.id)}
        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          isActive
            ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
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
            <span className="w-4" />
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
    </div>
  );
};
