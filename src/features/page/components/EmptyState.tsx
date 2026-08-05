import { vocabulary } from '@/core/vocabulary';
import { useNotesStore } from '@/stores/useNotesStore';

export const EmptyState = () => {
  const { createPage } = useNotesStore();

  const handleCreate = async () => {
    await createPage();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-sm w-full p-8 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-3xl space-y-5 shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-bold">
          📝
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] capitalize">
            Sin {vocabulary.page} seleccionada
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Crea tu primera {vocabulary.page} para comenzar a escribir y organizar tus ideas.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <span>+</span>
          <span className="capitalize">Crear {vocabulary.page}</span>
        </button>
      </div>
    </div>
  );
};
