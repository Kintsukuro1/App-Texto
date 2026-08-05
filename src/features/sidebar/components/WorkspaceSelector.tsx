import { useEffect, useState, useRef } from 'react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

export const WorkspaceSelector = () => {
  const {
    workspaces,
    activeWorkspaceId,
    name,
    fetchWorkspaces,
    setActiveWorkspace,
    createWorkspace,
  } = useWorkspaceStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const ok = await createWorkspace(newWsName.trim());
    if (ok) {
      setNewWsName('');
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 overflow-hidden hover:bg-[var(--bg-primary)] p-1 rounded-lg transition-colors cursor-pointer w-full text-left group"
        title="Cambiar Espacio de Trabajo"
      >
        <span className="text-base shrink-0">✨</span>
        <span className="font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent truncate flex-1">
          {name || 'Mi Espacio'}
        </span>
        <span className="text-[10px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] shrink-0 font-mono">
          ▾
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-fade-in">
          <div className="px-2 py-1 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Espacios de Trabajo ({workspaces.length})
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>🏢</span>
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {isActive && <span className="text-indigo-400 text-xs">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="border-t border-[var(--border-muted)] pt-1 mt-1">
            {isCreating ? (
              <form onSubmit={handleCreate} className="p-1 space-y-1">
                <input
                  type="text"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="Nombre del espacio..."
                  autoFocus
                  className="w-full px-2 py-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-0.5 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-0.5 text-[10px] bg-indigo-600 text-white rounded font-medium"
                  >
                    Crear
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-600/10 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>➕</span>
                <span>Crear nuevo espacio</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
