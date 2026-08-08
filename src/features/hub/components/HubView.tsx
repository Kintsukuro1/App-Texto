import { useState } from 'react';
import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { useMascotState } from '../hooks/useMascotState';
import { Mascot } from './Mascot';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { vocabulary } from '@/core/vocabulary';
import type { Page } from '@/types/page';
import { PageIcon } from '@/components/common/PageIcon';
import { ObsidianImporterModal } from '@/features/importer/components/ObsidianImporterModal';
import {
  FileText,
  Calendar,
  Download,
  Star,
  Clock,
  ArrowRight,
  Network,
  Plus,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

export const HubView = () => {
  const { message, subtitle } = useTimeOfDay();
  const { mood, triggerHappyReaction } = useMascotState();
  const { user } = useAuthStore();
  const { pages, recentPageIds, setActivePageId, createPage, getOrCreateDailyNote, toggleFavorite } = useNotesStore();
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  const allPages = Object.values(pages);

  // 1. Favoritos (máximo 6)
  const favorites = allPages.filter((p) => p.isFavorite).slice(0, 6);

  // 2. Recientes (máximo 6)
  const recentPages = recentPageIds
    .map((id) => pages[id])
    .filter((p): p is Page => Boolean(p))
    .slice(0, 6);

  const hasAnyNotes = allPages.length > 0;

  const currentHour = new Date().getHours();
  const isNight = currentHour >= 19 || currentHour < 6;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Mesh Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40" style={{
        background: 'radial-gradient(circle at top right, rgba(192, 193, 255, 0.08) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(73, 75, 214, 0.05) 0%, transparent 50%)'
      }} />

      <div className="max-w-5xl w-full mx-auto px-6 sm:px-10 py-8 space-y-8 z-10 relative">
        {/* HERO SECTION: Avatar & Dynamic Greeting */}
        <section className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full bg-[var(--bg-surface)] border border-[var(--border-muted)] shadow-xl flex-shrink-0 flex items-center justify-center">
              {user ? (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-2xl font-extrabold text-white shadow-inner"
                  style={{ backgroundColor: user.color }}
                >
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-xl text-white font-bold">
                  NL
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 border-2 border-[var(--bg-primary)] flex items-center justify-center text-white shadow-md animate-pulse">
                {isNight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-1 flex items-center gap-1.5 opacity-90">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{message}</span>
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {user?.username || 'Felipe'}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Interactive Mascot SVG Graphic */}
          <div className="flex items-center gap-4 shrink-0">
            <Mascot mood={mood} onClick={triggerHappyReaction} size={76} />
          </div>
        </section>

        {/* ACTION CARDS GRID (3 High-Impact Quick Buttons) */}
        <section className="z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Nueva Nota */}
            <button
              onClick={() => createPage()}
              className="group flex flex-col justify-between p-5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all duration-300 min-h-[140px] relative overflow-hidden text-left cursor-pointer"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
              <div className="flex justify-between items-start w-full relative z-10">
                <FileText className="w-8 h-8 opacity-90" />
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-bold text-lg leading-none mb-1">Nueva Nota</h3>
                <p className="text-xs opacity-80">Crear documento en blanco</p>
              </div>
            </button>

            {/* Card 2: Nota Diaria */}
            <button
              onClick={() => getOrCreateDailyNote()}
              className="group flex flex-col justify-between p-5 rounded-2xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-muted)] hover:border-amber-500/50 hover:bg-[var(--bg-hover)] shadow-md hover:shadow-lg transition-all duration-300 min-h-[140px] text-left cursor-pointer"
            >
              <div className="flex justify-between items-start w-full">
                <Calendar className="w-8 h-8 text-amber-400" />
                <ArrowRight className="w-5 h-5 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="mt-auto">
                <h3 className="font-bold text-lg leading-none mb-1">Nota Diaria</h3>
                <p className="text-xs text-[var(--text-secondary)]">Registro del día (Journal)</p>
              </div>
            </button>

            {/* Card 3: Importar Markdown */}
            <button
              onClick={() => setIsImporterOpen(true)}
              className="group flex flex-col justify-between p-5 rounded-2xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-muted)] hover:border-cyan-500/50 hover:bg-[var(--bg-hover)] shadow-md hover:shadow-lg transition-all duration-300 min-h-[140px] text-left cursor-pointer"
            >
              <div className="flex justify-between items-start w-full">
                <Download className="w-8 h-8 text-cyan-400" />
                <ArrowRight className="w-5 h-5 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <div className="mt-auto">
                <h3 className="font-bold text-lg leading-none mb-1">Importar Markdown</h3>
                <p className="text-xs text-[var(--text-secondary)]">Desde Obsidian o .md local</p>
              </div>
            </button>
          </div>
        </section>

        {/* CONTENT SECTIONS: Favorites & Recients Grid */}
        {hasAnyNotes ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">
            {/* Section 1: Favoritas */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Notas Favoritas</span>
                </h2>
                {favorites.length > 0 && (
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {favorites.length} guardadas
                  </span>
                )}
              </div>

              {favorites.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {favorites.map((page) => (
                    <div
                      key={page.id}
                      onClick={() => setActivePageId(page.id)}
                      className="group p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-muted)] hover:border-indigo-500/40 hover:bg-[var(--bg-hover)] transition-all flex items-center gap-3 shadow-sm cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-muted)] flex items-center justify-center text-on-surface-variant group-hover:text-indigo-400 transition-colors shrink-0 overflow-hidden">
                        <PageIcon icon={page.icon} className="w-full h-full object-cover" fallback={<FileText className="w-4 h-4 text-slate-400" />} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-indigo-300 transition-colors">
                          {page.title || 'Sin título'}
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)] truncate">
                          Editado {new Date(page.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(page.id);
                        }}
                        className="text-amber-400 hover:text-amber-300 transition-transform hover:scale-110 p-1 cursor-pointer"
                        title="Quitar de favoritas"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-muted)] text-center text-xs text-[var(--text-secondary)]">
                  Marca tus notas importantes con una estrella para tenerlas siempre aquí.
                </div>
              )}
            </section>

            {/* Section 2: Acceso Reciente & Grafo */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Acceso Reciente</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {recentPages.slice(0, 2).map((page, idx) => (
                  <div
                    key={page.id}
                    onClick={() => setActivePageId(page.id)}
                    className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-muted)] hover:border-indigo-500/40 hover:bg-[var(--bg-hover)] transition-all shadow-sm flex flex-col justify-between h-28 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-indigo-400">
                        <PageIcon icon={page.icon} className="w-full h-full object-cover" fallback={<FileText className="w-3.5 h-3.5 text-indigo-400" />} />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-secondary)]">
                        {idx === 0 ? 'Hoy' : 'Reciente'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors line-clamp-2 mt-auto">
                      {page.title || 'Sin título'}
                    </h4>
                  </div>
                ))}

                {/* Tarjeta Destacada de Explorar Grafo */}
                <div
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-graph-view'));
                  }}
                  className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all shadow-md flex items-center gap-3 col-span-2 relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-12 -mb-12 pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Network className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors">
                      Explorar Grafo de Conocimiento
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Visualiza conexiones interactivas entre tus notas
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 rounded-3xl border border-dashed border-[var(--border-muted)] text-center space-y-4 bg-[var(--bg-surface)]">
            <FileText className="w-12 h-12 text-indigo-400 mx-auto opacity-80" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Tu espacio de trabajo está listo
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                No tienes ninguna {vocabulary.page} creada aún. Crea tu primera {vocabulary.page} para comenzar.
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

      {/* Modal de Importación de Obsidian / Markdown */}
      <ObsidianImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
      />
    </div>
  );
};
