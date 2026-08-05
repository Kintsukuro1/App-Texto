import { useEffect, useRef } from 'react';
import { useNotesStore } from '@/stores/useNotesStore';

interface Node {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
}

interface GraphViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GraphViewModal = ({ isOpen, onClose }: GraphViewModalProps) => {
  const { pages, setActivePageId } = useNotesStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const pageList = Object.values(pages);
    if (pageList.length === 0) return;

    const width = 700;
    const height = 500;

    // Crear Nodos
    const nodes: Node[] = pageList.map((p, idx) => {
      const angle = (idx / pageList.length) * 2 * Math.PI;
      const dist = 120 + Math.random() * 80;
      return {
        id: p.id,
        title: p.title || 'Sin título',
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 14,
        color: '#6366f1',
      };
    });

    // Crear Aristas basadas en menciones [[Nombre]] o relaciones Padre-Hijo
    const edges: Edge[] = [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const titleMap = new Map(nodes.map((n) => [n.title.toLowerCase(), n.id]));

    pageList.forEach((p) => {
      if (p.parentId && nodeMap.has(p.parentId)) {
        edges.push({ source: p.id, target: p.parentId });
      }

      // Buscar menciones [[Nombre]] en el contenido
      const mentions = p.content.match(/\[\[(.*?)\]\]/g) || [];
      mentions.forEach((m) => {
        const targetTitle = m.replace(/\[\[|\]\]/g, '').trim().toLowerCase();
        const targetId = titleMap.get(targetTitle);
        if (targetId && targetId !== p.id) {
          edges.push({ source: p.id, target: targetId });
        }
      });
    });

    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Simulación física básica
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.95;
        n.vy *= 0.95;

        if (n.x < 30 || n.x > width - 30) n.vx *= -1;
        if (n.y < 30 || n.y > height - 30) n.vy *= -1;
      });

      // Limpiar Canvas
      ctx.clearRect(0, 0, width, height);

      // Dibujar Aristas
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 1.5;
      edges.forEach((e) => {
        const source = nodeMap.get(e.source);
        const target = nodeMap.get(e.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });

      // Dibujar Nodos
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);
        ctx.fillStyle = n.color;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Borde nodo
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Texto Título
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          n.title.length > 12 ? `${n.title.substring(0, 12)}...` : n.title,
          n.x,
          n.y + n.radius + 14
        );
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, pages]);

  if (!isOpen) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pageList = Object.values(pages);
    const width = 700;
    const height = 500;

    pageList.forEach((p, idx) => {
      const angle = (idx / pageList.length) * 2 * Math.PI;
      const dist = 120 + (idx % 3) * 30;
      const nx = width / 2 + Math.cos(angle) * dist;
      const ny = height / 2 + Math.sin(angle) * dist;

      const dx = clickX - nx;
      const dy = clickY - ny;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        setActivePageId(p.id);
        onClose();
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕸️</span>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Red de Conocimiento 2D (Graph View)
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Páginas interconectadas por menciones y jerarquía
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Canvas Area */}
        <div className="relative rounded-xl border border-[var(--border-muted)] bg-slate-950 overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            width={700}
            height={500}
            onClick={handleCanvasClick}
            className="cursor-pointer"
          />
        </div>

        <p className="text-[11px] text-[var(--text-muted)] italic">
          💡 Haz clic en cualquier nodo para abrir la nota correspondiente.
        </p>
      </div>
    </div>
  );
};
