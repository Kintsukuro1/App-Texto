import { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  action: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
}

export const ContextMenu = ({ x, y, isOpen, onClose, items }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Prevenir que el menú se salga de la pantalla por la derecha o por abajo
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const menuWidth = 200;
  const menuHeight = items.length * 36 + 16;

  const adjustedX = x + menuWidth > screenWidth ? Math.max(10, screenWidth - menuWidth - 10) : x;
  const adjustedY = y + menuHeight > screenHeight ? Math.max(10, screenHeight - menuHeight - 10) : y;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-52 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-xl shadow-2xl animate-fade-in select-none text-xs"
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={(e) => {
            e.stopPropagation();
            item.action();
            onClose();
          }}
          className={`w-full px-3 py-2 text-left flex items-center gap-2 font-medium transition-colors cursor-pointer ${
            item.danger
              ? 'text-rose-400 hover:bg-rose-500/15'
              : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          {item.icon && <span className="text-sm shrink-0">{item.icon}</span>}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
