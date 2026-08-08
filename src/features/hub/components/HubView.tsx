import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { useMascotState } from '../hooks/useMascotState';
import { Mascot } from './Mascot';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { vocabulary } from '@/core/vocabulary';
import type { Page } from '@/types/page';
import { PageIcon } from '@/components/common/PageIcon';
import { AuroraBackground } from '@/components/common/AuroraBackground';
import { SpotlightCard } from '@/components/common/SpotlightCard';
import { Star, Clock, Plus, FileText, Sparkles } from 'lucide-react';

export const HubView = () => {
  const { message, gradient, subtitle } = useTimeOfDay();
  const { mood, triggerHappyReaction } = useMascotState();
  const { user } = useAuthStore();
  const { pages, recentPageIds, setActivePageId, createPage } = useNotesStore();

  const allPages = Object.values(pages);

  // 1. Favoritos (máximo 6)
  const favorites = allPages.filter((p) => p.isFavorite).slice(0, 6);

  // 2. Recientes (máximo 6)
  const recentPages = recentPageIds
    .map((id) => pages[id])
    .filter((p): p is Page => Boolean(p))
    .slice(0, 6);

  const hasAnyNotes = allPages.length > 0;

  const renderCard = (page: Page) => {
    return (
      <SpotlightCard
        key={page.id}
        onClick={() => setActivePageId(page.id)}
        className="group cursor-pointer flex flex-col justify-between space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] flex items-center justify-center text-xl overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-200">
            <PageIcon icon={page.icon} className="w-full h-full object-cover" fallback={<FileText className="w-4 h-4 text-slate-400" />} />
          </div>
          {page.isFavorite && (
            <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>Favorita</span>
            </span>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors truncate">
            {page.title || 'Sin título'}
          </h4>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            Actualizada en {new Date(page.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </SpotlightCard>
    );
  };

  return (
    <AuroraBackground className="flex-1 flex flex-col h-full overflow-y-auto selection:bg-indigo-500 selection:text-white">
      <div className="max-w-5xl w-full mx-auto px-8 sm:px-12 py-10 space-y-10">
        {/* Top Hero Section: Greeting & Mascot */}
        <div className="relative p-8 rounded-3xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-muted)] overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 z-10 max-w-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>{message}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {message}, {user?.username || 'de nuevo'}
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Interactive Mascot Component */}
          <div className="flex items-center gap-4 z-10 shrink-0 self-end md:self-center">
            <Mascot mood={mood} onClick={triggerHappyReaction} size={72} />
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Shortcut Sections */}
        {hasAnyNotes ? (
          <div className="space-y-8">
            {/* Section 1: Favoritos */}
            {favorites.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wider uppercase">
                    Notas Favoritas
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map(renderCard)}
                </div>
              </div>
            )}

            {/* Section 2: Recientes */}
            {recentPages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wider uppercase">
                    Acceso Reciente
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {recentPages.map(renderCard)}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State when no pages exist */
          <div className="p-12 rounded-3xl border border-dashed border-[var(--border-muted)] text-center space-y-4 bg-[var(--bg-surface)]/60 backdrop-blur-md">
            <FileText className="w-12 h-12 text-indigo-400 mx-auto opacity-80" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Tu espacio de trabajo está listo
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                No tienes ninguna {vocabulary.page} creada aún. Crea tu primera {vocabulary.page} para comenzar a organizar tus notas.
              </p>
            </div>
            <button
              onClick={() => createPage()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Crear primera {vocabulary.page}</span>
            </button>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
};
