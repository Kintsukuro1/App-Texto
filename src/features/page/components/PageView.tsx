import { useState, useEffect, useRef } from 'react';
import type { Page } from '@/types/page';
import { useNotesStore } from '@/stores/useNotesStore';
import { Editor } from '@/features/editor/components/Editor';
import { usePresence } from '@/features/editor/hooks/usePresence';
import { BacklinksPanel } from './BacklinksPanel';
import { PageIcon } from '@/components/common/PageIcon';
import { VersionHistoryModal } from './VersionHistoryModal';
import { CommentsPanel } from './CommentsPanel';
import { exportPageAsMarkdown, exportPageAsHTML } from '@/core/exporter';
import type { HocuspocusProvider } from '@hocuspocus/provider';
import { API_BASE_URL } from '@/core/config';

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
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const [collabProvider, setCollabProvider] = useState<HocuspocusProvider | null>(null);
  const presenceUsers = usePresence(collabProvider);

  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const iconFileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const fullUrl = data.url.startsWith('http') ? data.url : `${API_BASE_URL}${data.url}`;
        handleCoverChange(fullUrl);
        setShowCoverInput(false);
      }
    } catch (err) {
      console.error('Error al subir imagen', err);
    } finally {
      setIsUploadingCover(false);
    }
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
        {/* Cover Input Field Modal/Bar */}
        {showCoverInput && (
          <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-xl space-y-3 animate-fade-in shadow-lg">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
              <span>Portada de la página (Imagen / GIF)</span>
              <button
                onClick={() => setShowCoverInput(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="px-3.5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {isUploadingCover ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <span>📁</span>
                    <span>Subir desde dispositivo</span>
                  </>
                )}
              </button>

              <div className="flex-1 flex gap-2">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => handleCoverChange(e.target.value)}
                  placeholder="O pega una URL: https://..."
                  className="flex-1 px-3 py-2 text-xs bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => setShowCoverInput(false)}
                  className="px-3 py-2 text-xs bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] border border-[var(--border-muted)] text-[var(--text-primary)] rounded-lg transition-colors"
                >
                  Listo
                </button>
              </div>
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
            {/* Indicador de Autoguardado en tiempo real (estilo Google Docs / Notion) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-muted)] text-[11px] font-medium transition-all">
              {saveStatus === 'saving' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span className="text-amber-400 font-mono">💾 Guardando...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[var(--text-secondary)] font-mono">☁️ Guardado en SQLite</span>
                </>
              )}
            </div>

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
              onClick={() => exportPageAsMarkdown(page)}
              className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Exportar como Markdown (.md)"
            >
              📤 .md
            </button>

            <button
              onClick={() => exportPageAsHTML(page)}
              className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Exportar como HTML (.html)"
            >
              📄 .html
            </button>

            <button
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
              title="Comentarios"
            >
              💬 Comentarios {commentsCount > 0 && <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-bold">{commentsCount}</span>}
            </button>

            <button
              onClick={() => setIsVersionHistoryOpen(true)}
              className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
              title="Historial de versiones"
            >
              📜 Historial
            </button>

            <button
              onClick={() => deletePage(page.id)}
              className="hover:text-rose-400 transition-colors cursor-pointer"
              title="Eliminar nota"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>

        {/* Icon Display / Input Controls */}
        {(icon || showIconInput) && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-4">
              <div
                onClick={() => setShowIconInput(!showIconInput)}
                className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-muted)] flex items-center justify-center text-4xl cursor-pointer hover:border-indigo-500 transition-all overflow-hidden shadow-sm shrink-0"
              >
                <PageIcon icon={icon} className="w-full h-full object-cover" fallback="📄" />
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setShowIconInput(!showIconInput)}
                  className="text-xs font-medium text-[var(--text-primary)] hover:text-indigo-400 text-left transition-colors cursor-pointer"
                >
                  {showIconInput ? 'Ocultar opciones' : 'Cambiar ícono / GIF'}
                </button>
                <button
                  onClick={() => handleIconChange('')}
                  className="text-[11px] text-rose-400 hover:text-rose-300 text-left transition-colors cursor-pointer"
                >
                  Quitar ícono
                </button>
              </div>
            </div>

            {/* Subpanel de selección de Ícono (Emoji, Subir Imagen/GIF o URL) */}
            {showIconInput && (
              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-xl space-y-3 animate-fade-in shadow-md max-w-lg">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
                  <span>Seleccionar ícono de página (Emoji, Imagen o GIF)</span>
                  <button
                    onClick={() => setShowIconInput(false)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={iconFileInputRef}
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingIcon(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        const res = await fetch(`${API_BASE_URL}/api/upload`, {
                          method: 'POST',
                          credentials: 'include',
                          body: formData,
                        });
                        if (res.ok) {
                          const data = await res.json();
                          const fullUrl = data.url.startsWith('http') ? data.url : `${API_BASE_URL}${data.url}`;
                          handleIconChange(fullUrl);
                          setShowIconInput(false);
                        }
                      } catch (err) {
                        console.error('Error al subir ícono:', err);
                      } finally {
                        setIsUploadingIcon(false);
                      }
                    }}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => iconFileInputRef.current?.click()}
                    disabled={isUploadingIcon}
                    className="px-3 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isUploadingIcon ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <span>📁</span>
                        <span>Subir Imagen / GIF</span>
                      </>
                    )}
                  </button>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => handleIconChange(e.target.value)}
                      placeholder="Emoji (😀) o URL de imagen..."
                      className="flex-1 px-3 py-2 text-xs bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => setShowIconInput(false)}
                      className="px-3 py-2 text-xs bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] border border-[var(--border-muted)] text-[var(--text-primary)] rounded-lg transition-colors"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              </div>
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

        {/* Tags Section */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          {(page.tags || []).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
            >
              <span>#{tag}</span>
              <button
                onClick={() => {
                  const nextTags = (page.tags || []).filter((t) => t !== tag);
                  updatePage(page.id, { tags: nextTags });
                }}
                className="hover:text-rose-400 transition-colors text-[10px] ml-0.5 cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}

          {/* Add Tag Input / Button */}
          <button
            onClick={() => {
              const tag = prompt('Nombre de la etiqueta (ej. trabajo, idea):');
              if (tag && tag.trim()) {
                const cleaned = tag.trim().replace(/^#/, '').toLowerCase();
                const existing = page.tags || [];
                if (!existing.includes(cleaned)) {
                  updatePage(page.id, { tags: [...existing, cleaned] });
                }
              }
            }}
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-muted)] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>🏷️</span>
            <span>+ Etiqueta</span>
          </button>
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
            onSavingStatusChange={(status) => setSaveStatus(status)}
          />
        </div>

        {/* Backlinks Panel */}
        <BacklinksPanel currentPage={page} />
      </div>

      {/* Modal de Historial de Versiones */}
      <VersionHistoryModal
        page={page}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
      />

      {/* Panel de Comentarios */}
      <CommentsPanel
        page={page}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentsCountChange={(cnt) => setCommentsCount(cnt)}
      />
    </div>
  );
};
