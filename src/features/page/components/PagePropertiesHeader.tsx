import { useState } from 'react';
import type { Page } from '@/types/page';
import { useNotesStore } from '@/stores/useNotesStore';
import { Clock, Flag, Calendar, Users, Tag, Plus, X, Flame } from 'lucide-react';

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

  // Cargar propiedades guardadas de la nota (o vacías por defecto)
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
      { id: 'prop-priority', name: 'Prioridad', type: 'priority', value: 'Alta' },
      { id: 'prop-date', name: 'Deadline', type: 'date', value: new Date().toISOString().split('T')[0] },
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
        ? 'Alta'
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

  const getPropIcon = (type: PagePropertyItem['type']) => {
    switch (type) {
      case 'status':
        return <Clock className="w-4 h-4 text-indigo-400" />;
      case 'priority':
        return <Flag className="w-4 h-4 text-amber-400" />;
      case 'date':
        return <Calendar className="w-4 h-4 text-cyan-400" />;
      case 'person':
        return <Users className="w-4 h-4 text-emerald-400" />;
      default:
        return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-2.5 my-4 text-xs font-medium text-[var(--text-secondary)] select-none">
      {properties.map((prop) => (
        <div key={prop.id} className="grid grid-cols-[140px_1fr] items-center gap-4 group">
          {/* Columna Nombre Propiedad */}
          <div className="flex items-center gap-2 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {getPropIcon(prop.type)}
            <span className="font-semibold text-xs">{prop.name}</span>
          </div>

          {/* Columna Valor & Controles */}
          <div className="flex items-center gap-2">
            {prop.type === 'status' ? (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-300 font-semibold rounded-lg border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <select
                  value={prop.value}
                  onChange={(e) => handleValueChange(prop.id, e.target.value)}
                  className="bg-transparent text-amber-300 outline-none cursor-pointer text-xs font-semibold"
                >
                  <option value="Por hacer" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Por hacer</option>
                  <option value="En progreso" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">En progreso</option>
                  <option value="Completado" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Completado</option>
                  <option value="Pausado" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Pausado</option>
                </select>
              </div>
            ) : prop.type === 'priority' ? (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 text-rose-300 font-bold rounded-lg border border-rose-500/20 cursor-pointer hover:bg-rose-500/20 transition-colors">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <select
                  value={prop.value}
                  onChange={(e) => handleValueChange(prop.id, e.target.value)}
                  className="bg-transparent text-rose-300 outline-none cursor-pointer text-xs font-bold"
                >
                  <option value="Baja" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Baja</option>
                  <option value="Media" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Media</option>
                  <option value="Alta" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Alta 🔥</option>
                  <option value="Urgente" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Urgente 🔥🔥</option>
                </select>
              </div>
            ) : prop.type === 'date' ? (
              <input
                type="date"
                value={prop.value}
                onChange={(e) => handleValueChange(prop.id, e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] text-xs outline-none focus:border-indigo-500 cursor-pointer hover:border-indigo-500/50 transition-colors"
              />
            ) : (
              <input
                type="text"
                value={prop.value}
                onChange={(e) => handleValueChange(prop.id, e.target.value)}
                placeholder="Valor..."
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] text-xs outline-none focus:border-indigo-500 min-w-[140px]"
              />
            )}

            <button
              type="button"
              onClick={() => handleRemoveProperty(prop.id)}
              className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-rose-400 transition-all p-1 rounded cursor-pointer ml-1"
              title="Eliminar propiedad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* Botón para añadir propiedad */}
      <div className="grid grid-cols-[140px_1fr] items-center gap-4 pt-1 mt-1 border-t border-[var(--border-muted)]/40">
        {!isAddingProperty ? (
          <button
            type="button"
            onClick={() => setIsAddingProperty(true)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs py-1 hover:underline"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Añadir propiedad</span>
          </button>
        ) : (
          <form onSubmit={handleAddProperty} className="flex items-center gap-2 animate-fade-in col-span-2">
            <input
              type="text"
              required
              autoFocus
              placeholder="Nombre del campo..."
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[var(--bg-primary)] border border-indigo-500 rounded-lg text-[var(--text-primary)] outline-none"
            />
            <select
              value={newPropType}
              onChange={(e) => setNewPropType(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg text-[var(--text-primary)] outline-none"
            >
              <option value="text">Texto</option>
              <option value="status">Estado</option>
              <option value="priority">Prioridad</option>
              <option value="date">Fecha</option>
              <option value="person">Persona</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Añadir
            </button>
            <button
              type="button"
              onClick={() => setIsAddingProperty(false)}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
