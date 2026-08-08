import { PageIcon } from '@/components/common/PageIcon';
import type { Page } from '@/types/page';

interface PagePeekPopoverProps {
  page: Page | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

export const PagePeekPopover = ({
  page,
  position,
  onClose,
  onNavigate,
}: PagePeekPopoverProps) => {
  if (!page || !position) return null;

  const getContentSnippet = (content: string) => {
    if (!content) return 'Esta página no tiene contenido aún.';
    try {
      const blocks = JSON.parse(content);
      if (Array.isArray(blocks)) {
        const textParts: string[] = [];
        blocks.forEach((b: any) => {
          if (b.content && Array.isArray(b.content)) {
            b.content.forEach((c: any) => {
              if (c.text) textParts.push(c.text);
            });
          }
        });
        const combined = textParts.join(' ');
        return combined.length > 180 ? combined.slice(0, 180) + '...' : combined;
      }
    } catch {
      // Si no es JSON válido, limpiar etiquetas básicas
      const cleaned = content.replace(/<[^>]*>/g, ' ');
      return cleaned.length > 180 ? cleaned.slice(0, 180) + '...' : cleaned;
    }
    return 'Sin contenido adicional.';
  };

  const snippet = getContentSnippet(page.content);

  return (
    <div
      style={{
        top: `${position.y + 12}px`,
        left: `${Math.min(position.x, window.innerWidth - 320)}px`,
      }}
      className="fixed z-50 w-72 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-2xl p-4 animate-fade-in backdrop-blur-md"
      onMouseLeave={onClose}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <PageIcon icon={page.icon} className="w-6 h-6 rounded object-cover shrink-0" fallback="📄" />
        <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate flex-1">
          {page.title || 'Sin título'}
        </h4>
        {page.isFavorite && <span className="text-xs text-amber-400">★</span>}
      </div>

      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-4 bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-muted)]/50">
        {snippet}
      </p>

      {page.tags && page.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {page.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          onNavigate(page.id);
          onClose();
        }}
        className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span>Abrir nota</span>
        <span>→</span>
      </button>
    </div>
  );
};
