import { useState } from 'react';
import { NOTE_TEMPLATES, type NoteTemplate } from '../data/templates';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: NoteTemplate) => void;
}

export const TemplatePickerModal = ({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatePickerModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  if (!isOpen) return null;

  const categories = ['Todas', 'Trabajo', 'Gestión', 'Personal'];

  const filteredTemplates = NOTE_TEMPLATES.filter((t) =>
    selectedCategory === 'Todas' ? true : t.category === selectedCategory
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-muted)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <span className="text-xl">📑</span>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Plantillas de Nota
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Selecciona una plantilla para rellenar automáticamente la nota con contenido estructurado.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Categorías Filter */}
        <div className="px-5 py-3 border-b border-[var(--border-muted)] flex items-center gap-2 bg-[var(--bg-primary)]">
          <span className="text-xs font-mono text-[var(--text-secondary)] mr-1">Filtrar:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-muted)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4 scrollbar-thin">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => {
                onSelectTemplate(template);
                onClose();
              }}
              className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-muted)] hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-muted)] group-hover:scale-110 transition-transform">
                    {template.icon}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors mb-1">
                  {template.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {template.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-[var(--border-muted)]/50 flex items-center justify-between text-[11px] text-indigo-400 group-hover:underline">
                <span>Usar plantilla</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-muted)] bg-[var(--bg-primary)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>💡 Consejo: Las plantillas no sobreescriben el título si ya lo has cambiado.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-muted)] text-[var(--text-primary)] border border-[var(--border-muted)] font-medium cursor-pointer transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
