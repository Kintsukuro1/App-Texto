import { useEffect, useState } from 'react';
import { API_BASE_URL, getAuthHeaders } from '@/core/config';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotesStore } from '@/stores/useNotesStore';
import type { Page } from '@/types/page';

interface VersionItem {
  id: string;
  pageId: string;
  userId: string | null;
  title: string;
  content: string;
  createdAt: string;
  username: string | null;
  userColor: string | null;
}

interface VersionHistoryModalProps {
  page: Page;
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal = ({
  page,
  isOpen,
  onClose,
}: VersionHistoryModalProps) => {
  const { sessionToken } = useAuthStore();
  const { updatePage, fetchPages } = useNotesStore();

  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/${page.id}/versions`, {
        headers: getAuthHeaders(sessionToken),
        credentials: 'include',
      });
      if (res.ok) {
        const list: VersionItem[] = await res.json();
        setVersions(list);
        if (list.length > 0) {
          setSelectedVersion(list[0]);
        }
      }
    } catch (err) {
      console.error('Error cargando historial de versiones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, page.id]);

  if (!isOpen) return null;

  const handleCreateSnapshot = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/${page.id}/versions`, {
        method: 'POST',
        headers: getAuthHeaders(sessionToken),
        credentials: 'include',
      });
      if (res.ok) {
        await fetchVersions();
      }
    } catch (err) {
      console.error('Error al guardar versión:', err);
    }
  };

  const handleRestore = async (version: VersionItem) => {
    if (!confirm(`¿Restaurar la página a la versión del ${new Date(version.createdAt).toLocaleString()}?`)) {
      return;
    }

    setIsRestoring(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/pages/${page.id}/versions/${version.id}/restore`,
        {
          method: 'POST',
          headers: getAuthHeaders(sessionToken),
          credentials: 'include',
        }
      );

      if (res.ok) {
        const restoredPage: Page = await res.json();
        await updatePage(page.id, {
          title: restoredPage.title,
          content: restoredPage.content,
        });
        await fetchPages();
        onClose();
      }
    } catch (err) {
      console.error('Error al restaurar versión:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const formatContentSnippet = (contentJson: string) => {
    if (!contentJson) return '(Página vacía)';
    try {
      const parsed = JSON.parse(contentJson);
      if (Array.isArray(parsed)) {
        const textBlocks = parsed
          .map((b: { content?: Array<{ text?: string }> | string }) => {
            if (typeof b.content === 'string') return b.content;
            if (Array.isArray(b.content)) return b.content.map((c) => c.text || '').join('');
            return '';
          })
          .filter(Boolean);
        return textBlocks.join('\n') || '(Sin texto)';
      }
    } catch {
      // Fallback si no es JSON válido
    }
    return contentJson.replace(/<[^>]*>/g, ' ');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-muted)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Historial de Versiones
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {page.title || 'Sin título'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateSnapshot}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>📸</span>
              <span>Guardar versión actual</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body: Timeline list (left) & Preview (right) */}
        <div className="flex-1 flex overflow-hidden divide-x divide-[var(--border-muted)]">
          {/* Left: Timeline List */}
          <div className="w-1/3 overflow-y-auto p-2 space-y-1 scrollbar-thin bg-[var(--bg-primary)]">
            <div className="px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Instantáneas ({versions.length})
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                Cargando historial...
              </div>
            ) : versions.length > 0 ? (
              versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                const formattedDate = new Date(ver.createdAt).toLocaleString([], {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3 rounded-xl transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-[var(--text-primary)]'
                        : 'hover:bg-[var(--bg-surface)] border border-transparent text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="truncate text-[var(--text-primary)] font-semibold">
                        {ver.title || 'Sin título'}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ backgroundColor: ver.userColor || '#6366f1' }}
                      >
                        {(ver.username || 'A').substring(0, 1).toUpperCase()}
                      </div>
                      <span className="truncate">{ver.username || 'Anónimo'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[var(--text-secondary)] italic">
                No hay versiones guardadas aún. Presiona &ldquo;Guardar versión actual&rdquo;.
              </div>
            )}
          </div>

          {/* Right: Selected Version Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-surface)] p-4">
            {selectedVersion ? (
              <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-muted)]">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      {selectedVersion.title || 'Sin título'}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Guardado el {new Date(selectedVersion.createdAt).toLocaleString()} por{' '}
                      <span className="font-semibold text-indigo-400">
                        {selectedVersion.username || 'Anónimo'}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleRestore(selectedVersion)}
                    disabled={isRestoring}
                    className="px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <span>↺</span>
                    <span>Restaurar esta versión</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-muted)] text-xs text-[var(--text-primary)] font-mono whitespace-pre-wrap leading-relaxed scrollbar-thin">
                  {formatContentSnippet(selectedVersion.content)}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-secondary)]">
                Selecciona una versión a la izquierda para previsualizar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
