import { useState, useEffect, useRef } from 'react';
import type { Page } from '@/types/page';
import { useNotesStore } from '@/stores/useNotesStore';
import { Editor } from '@/features/editor/components/Editor';
import { usePresence } from '@/features/editor/hooks/usePresence';
import type { HocuspocusProvider } from '@hocuspocus/provider';

interface PageViewProps {
  page: Page;
}

export const PageView = ({ page }: PageViewProps) => {
  const { updatePage, deletePage, toggleFavorite } = useNotesStore();

  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon || '');
  const [coverImage, setCoverImage] = useState(page.coverImage || '');
  const [showCoverInput, setShowCoverInput] = useState(false);
  const [showIconInput, setShowIconInput] = useState(false);

  const [collabProvider, setCollabProvider] = useState<HocuspocusProvider | null>(null);
  const presenceUsers = usePresence(collabProvider);

  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(page.title);
    setIcon(page.icon || '');
    setCoverImage(page.coverImage || '');
  }, [page.id, page.title, page.icon, page.coverImage]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (titleDebounceRef.current) {
      clearTimeout(titleDebounceRef.current);
    }
    titleDebounceRef.current = setTimeout(() => {
      updatePage(page.id, { title: newTitle });
    }, 400);
  };

  const handleIconChange = (newIcon: string) => {
    setIcon(newIcon);
    updatePage(page.id, { icon: newIcon.trim() ? newIcon : null });
  };

  const handleCoverChange = (newCover: string) => {
    setCoverImage(newCover);
    updatePage(page.id, { coverImage: newCover.trim() ? newCover : null });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Cover Image Banner */}
      {coverImage ? (
        <div className="relative w-full h-48 sm:h-60 bg-[var(--bg-surface)] overflow-hidden group">
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover object-center"
            onError={() => {
              // Graceful fallback if image URL fails to load
            }}
          />
          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-surface)]/80 backdrop-blur-md p-1.5 rounded-xl border border-[var(--border-muted)]">
            <button
              onClick={() => setShowCoverInput(!showCoverInput)}
              className="px-2.5 py-1 text-xs text-[var(--text-primary)] hover:text-white bg-[var(--bg-primary)] rounded-lg transition-colors cursor-pointer"
            >
              Cambiar portada
            </button>
            <button
              onClick={() => handleCoverChange('')}
              className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Page Container */}
      <div className="max-w-4xl w-full mx-auto px-8 sm:px-12 pt-8 pb-16 space-y-6 flex-1">
        {/* Cover Input Field Modal/Bar if requested */}
        {showCoverInput && (
          <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-xl space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>URL de la imagen de portada:</span>
              <button
                onClick={() => setShowCoverInput(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => handleCoverChange(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => setShowCoverInput(false)}
                className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Action Controls & Active Presence Avatars */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-3">
            {!icon && !showIconInput && (
              <button
                onClick={() => setShowIconInput(true)}
                className="hover:text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>😀</span>
                <span>Añadir ícono</span>
              </button>
            )}
            {!coverImage && !showCoverInput && (
              <button
                onClick={() => setShowCoverInput(true)}
                className="hover:text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>🖼️</span>
                <span>Añadir portada</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Avatares de Presencia en Tiempo Real */}
            {presenceUsers.length > 0 && (
              <div className="flex items-center gap-2 bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[var(--border-muted)] animate-fade-in">
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  Editando ahora:
                </span>
                <div className="flex items-center -space-x-2">
                  {presenceUsers.map((u) => (
                    <div
                      key={u.id}
                      className="w-6 h-6 rounded-full border-2 border-[var(--bg-surface)] flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-indigo-500/30"
                      style={{ backgroundColor: u.color }}
                      title={`${u.username} (En línea)`}
                    >
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => deletePage(page.id)}
              className="hover:text-rose-400 transition-colors cursor-pointer"
              title="Eliminar nota"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>

        {/* Icon Display / Input */}
        {(icon || showIconInput) && (
          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={4}
              value={icon}
              onChange={(e) => handleIconChange(e.target.value)}
              placeholder="📄"
              className="w-16 h-16 text-4xl text-center bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl focus:outline-none focus:border-indigo-500 text-[var(--text-primary)]"
            />
            {showIconInput && !icon && (
              <span className="text-xs text-[var(--text-secondary)]">Escribe o pega un emoji</span>
            )}
          </div>
        )}

        {/* Title & Favorite Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleFavorite(page.id)}
            className={`p-2 rounded-xl border transition-all cursor-pointer text-xl flex items-center justify-center shrink-0 ${
              page.isFavorite
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25 shadow-sm shadow-amber-500/10'
                : 'bg-[var(--bg-surface)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-amber-400 hover:border-indigo-500/50'
            }`}
            title={page.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorita'}
          >
            {page.isFavorite ? '★' : '☆'}
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Sin título"
            className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent border-none outline-none focus:ring-0 placeholder:[var(--text-secondary)] text-[var(--text-primary)] tracking-tight"
          />
        </div>

        {/* Rich Text Editor */}
        <div className="pt-4 border-t border-[var(--border-muted)]">
          <Editor
            key={page.id}
            pageId={page.id}
            initialContent={page.content}
            onContentChange={(newContent) =>
              updatePage(page.id, { content: newContent })
            }
            onProviderReady={(prov) => setCollabProvider(prov)}
          />
        </div>
      </div>
    </div>
  );
};
