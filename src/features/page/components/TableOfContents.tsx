import { useState, useMemo } from 'react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extraer encabezados del contenido JSON de BlockNote
  const headings: HeadingItem[] = useMemo(() => {
    if (!content) return [];
    try {
      const blocks = JSON.parse(content);
      if (!Array.isArray(blocks)) return [];

      const result: HeadingItem[] = [];
      blocks.forEach((block: any, idx: number) => {
        if (block.type === 'heading' || block.type?.includes('heading')) {
          const text = block.content?.map((c: any) => c.text).join('') || `Encabezado ${idx + 1}`;
          const level = block.props?.level || 2;
          const id = `heading-block-${idx}`;
          result.push({ id, text, level });
        }
      });
      return result;
    } catch {
      return [];
    }
  }, [content]);

  if (headings.length === 0) return null;

  const scrollToHeading = (index: number) => {
    // Buscar elementos en el DOM del editor BlockNote
    const editorEl = document.querySelector('.bn-editor') || document.querySelector('.blocknote-editor');
    if (!editorEl) return;

    const headingEls = editorEl.querySelectorAll('[data-content-type="heading"], h1, h2, h3');
    if (headingEls[index]) {
      headingEls[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <aside
      className={`fixed right-6 top-24 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-10' : 'w-64'
      }`}
    >
      <div className="bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-muted)] rounded-2xl shadow-xl p-3 flex flex-col gap-2 max-h-[70vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2 px-1">
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
              <span>🧭</span>
              <span>Tabla de Contenidos</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs transition-colors cursor-pointer ml-auto"
            title={isCollapsed ? 'Expandir Tabla de Contenidos' : 'Colapsar Tabla de Contenidos'}
          >
            {isCollapsed ? '🧭' : '➡️'}
          </button>
        </div>

        {/* Headings List */}
        {!isCollapsed && (
          <div className="overflow-y-auto space-y-1 max-h-[55vh] pr-1 scrollbar-thin text-xs">
            {headings.map((h, idx) => (
              <button
                key={h.id + idx}
                onClick={() => scrollToHeading(idx)}
                style={{ paddingLeft: `${(h.level - 1) * 12 + 6}px` }}
                className="w-full text-left py-1.5 pr-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors truncate block cursor-pointer"
                title={h.text}
              >
                <span className="opacity-40 font-mono text-[10px] mr-1.5">H{h.level}</span>
                {h.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
