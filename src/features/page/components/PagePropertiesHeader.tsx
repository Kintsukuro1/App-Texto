import { useState } from 'react';
import type { Page } from '@/types/page';
import { useNotesStore } from '@/stores/useNotesStore';

interface PagePropertiesHeaderProps {
  page: Page;
}

export interface PagePropertyItem {
  id: string;
  name: string;
  type: 'status' | 'priority' | 'date' | 'person' | 'text';
  value: string;
}

export const PagePropertiesHeader = ({ page }: PagePropertiesHeaderProps) => {
  const { updatePage } = useNotesStore();

  // Cargar propiedades guardadas de la nota (o vacías)
  const initialProperties: PagePropertyItem[] = (() => {
    try {
      if ((page as any).propertiesJson) {
        return JSON.parse((page as any).propertiesJson);
      }
    } catch {
      // Fallback
    }
    return [
      { id: 'prop-status', name: 'Estado', type: 'status', value: 'En progreso' },
      { id: 'prop-priority', name: 'Prioridad', type: 'priority', value: 'Media' },
    ];
  })();

  const [properties, setProperties] = useState<PagePropertyItem[]>(initialProperties);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<PagePropertyItem['type']>('text');

  const saveProperties = (updated: PagePropertyItem[]) => {
    setProperties(updated);
    updatePage(page.id, {
      propertiesJson: JSON.stringify(updated),
    } as any);
  };

  const handleValueChange = (id: string, newValue: string) => {
    const updated = properties.map((p) => (p.id === id ? { ...p, value: newValue } : p));
    saveProperties(updated);
  };

  const handleRemoveProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    saveProperties(updated);
  };

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim()) return;

    const defaultValue =
      newPropType === 'status'
        ? 'Por hacer'
        : newPropType === 'priority'
        ? 'Media'
        : newPropType === 'date'
        ? new Date().toISOString().split('T')[0]
        : '';

    const newProp: PagePropertyItem = {
      id: `prop-${Date.now()}`,
      name: newPropName.trim(),
      type: newPropType,
      value: defaultValue,
    };

    saveProperties([...properties, newProp]);
    setNewPropName('');
    setIsAddingProperty(false);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'En progreso':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Pausado':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Urgente':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
      case 'Alta':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Media':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="py-2 space-y-2 border-y border-[var(--border-muted)]/50 text-xs">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {properties.map((prop) => (
          <div key={prop.id} className="flex items-center gap-2 group shrink-0">
            <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1">
              <span>
                {prop.type === 'status'
                  ? '📌'
                  : prop.type === 'priority'
                  ? '⚡'
                  : prop.type === 'date'
                  ? '📅'
                  : prop.type === 'person'
                  ? '👤'
                  : '🏷️'}
              </span>
              <span>{prop.name}:</span>
            </span>

            {/* Renderizado dinámico de valor según tipo */}
            {prop.type === 'status' ? (
              <select
                value={prop.value}
                onChange={(e) => handleValueChange(prop.id, e.target.value)}
                className={`px-2 py-0.5 rounded-lg border text-xs font-semibold cursor-pointer outline-none transition-colors ${getStatusBadgeClass(
                  prop.value
                )}`}
              >
                <option value="Por hacer" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Por hacer</option>
                <option value="En progreso" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">En progreso</option>
                <option value="Completado" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Completado</option>
                <option value="Pausado" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Pausado</option>
              </select>
            ) : prop.type === 'priority' ? (
              <select
                value={prop.value}
                onChange={(e) => handleValueChange(prop.id, e.target.value)}
                className={`px-2 py-0.5 rounded-lg border text-xs font-semibold cursor-pointer outline-none transition-colors ${getPriorityBadgeClass(
                  prop.value
                )}`}
              >
                <option value="Baja" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Baja</option>
                <option value="Media" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Media</option>
                <option value="Alta" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Alta</option>
                <option value="Urgente" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Urgente 🔥</option>
              </select>
            ) : prop.type === 'date' ? (
              <input
                type="date"
                value={prop.value}
                onChange={(e) => handleValueChange(prop.id, e.target.value)}
                className="px-2 py-0.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] text-xs outline-none focus:border-indigo-500"
              />
            ) : (
              <input
                type="text"
                value={prop.value}
                onChange={(e) => handleValueChange(prop.id, e.target.value)}
                placeholder="Valor..."
                className="px-2 py-0.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] text-xs outline-none focus:border-indigo-500 min-w-[100px]"
              />
            )}

            <button
              type="button"
              onClick={() => handleRemoveProperty(prop.id)}
              className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-rose-400 transition-opacity p-0.5 rounded cursor-pointer"
              title="Eliminar propiedad"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Botón para añadir propiedad */}
        {!isAddingProperty ? (
          <button
            type="button"
            onClick={() => setIsAddingProperty(true)}
            className="text-[var(--text-secondary)] hover:text-indigo-400 font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs py-0.5 px-1 rounded-lg hover:bg-[var(--bg-surface)]"
          >
            <span>+</span>
            <span>Añadir propiedad</span>
          </button>
        ) : (
          <form onSubmit={handleAddProperty} className="flex items-center gap-1.5 animate-fade-in">
            <input
              type="text"
              required
              autoFocus
              placeholder="Nombre del campo..."
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              className="px-2 py-0.5 text-xs bg-[var(--bg-primary)] border border-indigo-500 rounded-lg text-[var(--text-primary)] outline-none"
            />
            <select
              value={newPropType}
              onChange={(e) => setNewPropType(e.target.value as any)}
              className="px-2 py-0.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg text-[var(--text-primary)] outline-none"
            >
              <option value="text">Texto</option>
              <option value="status">Estado</option>
              <option value="priority">Prioridad</option>
              <option value="date">Fecha</option>
              <option value="person">Persona</option>
            </select>
            <button
              type="submit"
              className="px-2 py-0.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              Añadir
            </button>
            <button
              type="button"
              onClick={() => setIsAddingProperty(false)}
              className="px-1.5 py-0.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              ✕
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
