import { useEffect, useState } from 'react';
import { API_BASE_URL, getAuthHeaders } from '@/core/config';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { Page } from '@/types/page';

export interface CommentItem {
  id: string;
  pageId: string;
  blockId: string | null;
  userId: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  username: string | null;
  userColor: string | null;
}

interface CommentsPanelProps {
  page: Page;
  isOpen: boolean;
  onClose: () => void;
  onCommentsCountChange?: (count: number) => void;
}

export const CommentsPanel = ({
  page,
  isOpen,
  onClose,
  onCommentsCountChange,
}: CommentsPanelProps) => {
  const { user, sessionToken } = useAuthStore();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/${page.id}/comments`, {
        headers: getAuthHeaders(sessionToken),
        credentials: 'include',
      });
      if (res.ok) {
        const list: CommentItem[] = await res.json();
        setComments(list);
        const unresolvedCount = list.filter((c) => !c.resolved).length;
        if (onCommentsCountChange) {
          onCommentsCountChange(unresolvedCount);
        }
      }
    } catch (err) {
      console.error('Error al obtener comentarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (page.id) {
      fetchComments();
    }
  }, [page.id]);

  if (!isOpen) return null;

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/${page.id}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(sessionToken),
        credentials: 'include',
        body: JSON.stringify({ content: newCommentText }),
      });

      if (res.ok) {
        setNewCommentText('');
        await fetchComments();
      }
    } catch (err) {
      console.error('Error al agregar comentario:', err);
    }
  };

  const handleToggleResolve = async (commentId: string, currentResolvedState: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/comments/${commentId}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(sessionToken),
        credentials: 'include',
        body: JSON.stringify({ resolved: !currentResolvedState }),
      });

      if (res.ok) {
        await fetchComments();
      }
    } catch (err) {
      console.error('Error al actualizar comentario:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(sessionToken),
        credentials: 'include',
      });

      if (res.ok) {
        await fetchComments();
      }
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
    }
  };

  const filteredComments = comments.filter((c) =>
    activeTab === 'active' ? !c.resolved : c.resolved
  );

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[var(--bg-surface)] border-l border-[var(--border-muted)] shadow-2xl flex flex-col animate-fade-in select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-muted)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Comentarios
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[var(--border-muted)] px-4 bg-[var(--bg-primary)] text-xs">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === 'active'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Activos ({comments.filter((c) => !c.resolved).length})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === 'resolved'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Resueltos ({comments.filter((c) => c.resolved).length})
        </button>
      </div>

      {/* List of comments */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-[var(--text-muted)]">
            Cargando comentarios...
          </div>
        ) : filteredComments.length > 0 ? (
          filteredComments.map((comment) => {
            const formattedDate = new Date(comment.createdAt).toLocaleString([], {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={comment.id}
                className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0"
                      style={{ backgroundColor: comment.userColor || '#6366f1' }}
                    >
                      {(comment.username || 'A').substring(0, 1).toUpperCase()}
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {comment.username || 'Anónimo'}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleResolve(comment.id, comment.resolved)}
                      className={`p-1 rounded transition-colors cursor-pointer text-xs ${
                        comment.resolved
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title={comment.resolved ? 'Marcar como activo' : 'Marcar como resuelto'}
                    >
                      ✓
                    </button>
                    {user && user.id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-xs"
                        title="Eliminar comentario"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[var(--text-primary)] leading-relaxed font-normal whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)] italic">
            {activeTab === 'active'
              ? 'No hay comentarios activos en esta página.'
              : 'No hay comentarios resueltos.'}
          </div>
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleCreateComment} className="p-3 border-t border-[var(--border-muted)] space-y-2 bg-[var(--bg-surface)]">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Escribe un comentario..."
          rows={2}
          className="w-full p-2.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Comentar
          </button>
        </div>
      </form>
    </div>
  );
};
