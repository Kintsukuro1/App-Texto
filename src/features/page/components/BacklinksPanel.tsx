import { useNotesStore } from '@/stores/useNotesStore';
import type { Page } from '@/types/page';

interface BacklinksPanelProps {
  currentPage: Page;
}

export const BacklinksPanel = ({ currentPage }: BacklinksPanelProps) => {
  const { pages, setActivePageId } = useNotesStore();

  const allPages = Object.values(pages);

  // Buscar páginas que hagan referencia a esta página (por ID o por título exacto en minúsculas)
  const backlinks = allPages.filter((otherPage) => {
    if (otherPage.id === currentPage.id) return false;
    if (!otherPage.content) return false;

    // Buscar el ID de la página actual o el título en el contenido JSON/texto
    const contentLower = otherPage.content.toLowerCase();
    const hasIdMatch = otherPage.content.includes(currentPage.id);
    const hasTitleMatch =
      currentPage.title &&
      currentPage.title.trim().length > 2 &&
      contentLower.includes(currentPage.title.trim().toLowerCase());

    return hasIdMatch || hasTitleMatch;
  });

  if (backlinks.length === 0) return null;

  return (
    <div className="mt-12 pt-6 border-t border-[var(--border-muted)] space-y-3 animate-fade-in">
      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        <span>🔗</span>
        <span>Páginas que mencionan esta nota ({backlinks.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {backlinks.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePageId(page.id)}
            className="text-left p-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-muted)] hover:border-indigo-500/40 transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">
              <span className="text-sm">{page.icon || '📄'}</span>
              <span className="truncate">{page.title || 'Sin título'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
              Ver referencia en esta nota...
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
