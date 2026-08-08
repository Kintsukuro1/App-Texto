import type { Page } from '@/types/page';
import { useNotesStore } from '@/stores/useNotesStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { ChevronRight, Layers, FileText } from 'lucide-react';
import { PageIcon } from './PageIcon';

interface BreadcrumbsProps {
  currentPage: Page;
}

export const Breadcrumbs = ({ currentPage }: BreadcrumbsProps) => {
  const { pages, setActivePageId } = useNotesStore();
  const { name: workspaceName } = useWorkspaceStore();

  // Construir la cadena de ancestros desde el padre hasta la raíz
  const ancestors: Page[] = [];
  let curr: Page | undefined = currentPage;

  while (curr && curr.parentId) {
    const parentId: string = curr.parentId;
    const parentPage: Page | undefined = pages[parentId];
    if (parentPage) {
      ancestors.unshift(parentPage);
      curr = parentPage;
    } else {
      break;
    }
  }

  return (
    <nav className="flex items-center flex-wrap gap-1 text-xs text-[var(--text-secondary)] font-medium mb-4">
      {/* Workspace Root */}
      <span className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer">
        <Layers className="w-3.5 h-3.5 text-indigo-400" />
        <span>{workspaceName || 'Espacio'}</span>
      </span>

      <ChevronRight className="w-3 h-3 text-[var(--text-secondary)] opacity-50 shrink-0" />

      {/* Páginas Padre (Ancestros) */}
      {ancestors.map((ancestor) => (
        <div key={ancestor.id} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActivePageId(ancestor.id)}
            className="flex items-center gap-1 hover:text-[var(--text-primary)] hover:underline transition-colors cursor-pointer truncate max-w-[140px]"
          >
            <PageIcon icon={ancestor.icon} className="w-3.5 h-3.5" fallback={<FileText className="w-3.5 h-3.5 text-slate-400" />} />
            <span className="truncate">{ancestor.title || 'Sin título'}</span>
          </button>
          <ChevronRight className="w-3 h-3 text-[var(--text-secondary)] opacity-50 shrink-0" />
        </div>
      ))}

      {/* Página Actual */}
      <span className="flex items-center gap-1 text-[var(--text-primary)] font-semibold truncate max-w-[200px]">
        <PageIcon icon={currentPage.icon} className="w-3.5 h-3.5" fallback={<FileText className="w-3.5 h-3.5 text-indigo-400" />} />
        <span className="truncate">{currentPage.title || 'Sin título'}</span>
      </span>
    </nav>
  );
};
