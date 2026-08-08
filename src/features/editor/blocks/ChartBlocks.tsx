import { useState } from 'react';
import { createReactBlockSpec } from '@blocknote/react';

// ----------------------------------------------------------------------------
// Types & Defaults
// ----------------------------------------------------------------------------
interface ChartDataItem {
  label: string;
  value: number;
}

const defaultChartData: ChartDataItem[] = [
  { label: 'Ene', value: 30 },
  { label: 'Feb', value: 65 },
  { label: 'Mar', value: 45 },
  { label: 'Abr', value: 85 },
  { label: 'May', value: 60 },
];

function safeParseData(jsonStr?: string, fallback = defaultChartData): ChartDataItem[] {
  if (!jsonStr) return fallback;
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => ({
        label: String(item.label || ''),
        value: Number(item.value) || 0,
      }));
    }
  } catch {
    // Fallback
  }
  return fallback;
}

// ----------------------------------------------------------------------------
// Editor Component for Editing Chart Data
// ----------------------------------------------------------------------------
function ChartEditorModal({
  title,
  data,
  onSave,
  onCancel,
}: {
  title: string;
  data: ChartDataItem[];
  onSave: (newTitle: string, newData: ChartDataItem[]) => void;
  onCancel: () => void;
}) {
  const [editTitle, setEditTitle] = useState(title);
  const [items, setItems] = useState<ChartDataItem[]>(data);

  const addItem = () => {
    setItems([...items, { label: `Item ${items.length + 1}`, value: 50 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'label' | 'value', val: string) => {
    const next = [...items];
    if (field === 'label') {
      next[index].label = val;
    } else {
      next[index].value = Number(val) || 0;
    }
    setItems(next);
  };

  return (
    <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl space-y-3 my-2 text-xs">
      <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
        <span>⚙️ Configurar Gráfico</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-[var(--text-secondary)] hover:text-white"
        >
          ✕ Cerrar
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-[var(--text-secondary)] font-semibold">Título del Gráfico</label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-muted)] text-[var(--text-primary)] outline-none focus:border-indigo-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-[var(--text-secondary)] font-semibold">Datos y Valores</label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Etiqueta"
                value={item.label}
                onChange={(e) => updateItem(idx, 'label', e.target.value)}
                className="flex-1 p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-muted)] text-[var(--text-primary)] outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Valor"
                value={item.value}
                onChange={(e) => updateItem(idx, 'value', e.target.value)}
                className="w-20 p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-muted)] text-[var(--text-primary)] outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Eliminar fila"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-muted)]">
        <button
          type="button"
          onClick={addItem}
          className="px-2.5 py-1 bg-[var(--bg-surface)] hover:bg-[var(--border-muted)] text-[var(--text-secondary)] hover:text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          + Añadir Dato
        </button>
        <button
          type="button"
          onClick={() => onSave(editTitle, items)}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold shadow-sm cursor-pointer"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 1. Vertical Bar Chart Block
// ----------------------------------------------------------------------------
export const ChartVerticalBarBlock = createReactBlockSpec(
  {
    type: 'chartVerticalBar',
    propSchema: {
      title: { default: 'Gráfico de Barras Verticales' },
      data: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [isEditing, setIsEditing] = useState(false);
      const data = safeParseData(block.props.data);
      const maxVal = Math.max(...data.map((d) => d.value), 1);

      const handleSave = (newTitle: string, newData: ChartDataItem[]) => {
        editor.updateBlock(block, {
          props: {
            title: newTitle,
            data: JSON.stringify(newData),
          },
        });
        setIsEditing(false);
      };

      const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📊</span>
              <span>{block.props.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              {isEditing ? '✕ Cancelar' : '⚙️ Editar datos'}
            </button>
          </div>

          {isEditing ? (
            <ChartEditorModal
              title={block.props.title}
              data={data}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex items-end justify-around h-36 pt-4 border-b border-[var(--border-muted)] px-2 gap-2">
              {data.map((item, i) => {
                const heightPct = Math.round((item.value / maxVal) * 100);
                const color = colors[i % colors.length];
                return (
                  <div key={i} className="flex flex-col items-center gap-1 group flex-1 max-w-[48px]">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] group-hover:text-indigo-300 transition-colors">
                      {item.value}
                    </span>
                    <div className="w-full bg-[var(--bg-primary)] h-full rounded-t-md flex items-end overflow-hidden">
                      <div
                        className={`w-full ${color} rounded-t-md transition-all duration-500 group-hover:brightness-125`}
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-[var(--text-secondary)] mt-1 truncate max-w-full">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 2. Horizontal Bar Chart Block
// ----------------------------------------------------------------------------
export const ChartHorizontalBarBlock = createReactBlockSpec(
  {
    type: 'chartHorizontalBar',
    propSchema: {
      title: { default: 'Gráfico de Barras Horizontales' },
      data: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [isEditing, setIsEditing] = useState(false);
      const data = safeParseData(block.props.data, [
        { label: 'Diseño UI', value: 80 },
        { label: 'Desarrollo API', value: 65 },
        { label: 'Testing QA', value: 40 },
        { label: 'Despliegue', value: 90 },
      ]);
      const maxVal = Math.max(...data.map((d) => d.value), 1);

      const handleSave = (newTitle: string, newData: ChartDataItem[]) => {
        editor.updateBlock(block, {
          props: {
            title: newTitle,
            data: JSON.stringify(newData),
          },
        });
        setIsEditing(false);
      };

      const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'];

      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📈</span>
              <span>{block.props.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              {isEditing ? '✕ Cancelar' : '⚙️ Editar datos'}
            </button>
          </div>

          {isEditing ? (
            <ChartEditorModal
              title={block.props.title}
              data={data}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-2.5 text-xs">
              {data.map((item, i) => {
                const widthPct = Math.round((item.value / maxVal) * 100);
                const color = colors[i % colors.length];
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-[var(--text-primary)]">{item.label}</span>
                      <span className="font-mono text-[var(--text-secondary)]">{item.value}</span>
                    </div>
                    <div className="w-full h-3 bg-[var(--bg-primary)] rounded-full border border-[var(--border-muted)] overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(widthPct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 3. Line Chart Block (Corregido sin desbordamientos y totalmente editable)
// ----------------------------------------------------------------------------
export const ChartLineBlock = createReactBlockSpec(
  {
    type: 'chartLine',
    propSchema: {
      title: { default: 'Gráfico de Líneas' },
      data: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [isEditing, setIsEditing] = useState(false);
      const data = safeParseData(block.props.data);

      const handleSave = (newTitle: string, newData: ChartDataItem[]) => {
        editor.updateBlock(block, {
          props: {
            title: newTitle,
            data: JSON.stringify(newData),
          },
        });
        setIsEditing(false);
      };

      // Cálculo exacto de coordenadas SVG para prevenir desbordamientos
      const svgWidth = 500;
      const svgHeight = 160;
      const padX = 40;
      const padY = 25;
      const chartW = svgWidth - padX * 2;
      const chartH = svgHeight - padY * 2;

      const values = data.map((d) => d.value);
      const minVal = Math.min(...values, 0);
      const maxVal = Math.max(...values, 10);
      const range = maxVal - minVal || 1;

      const points = data.map((item, i) => {
        const x = padX + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
        const y = padY + chartH - ((item.value - minVal) / range) * chartH;
        return { x, y, label: item.label, value: item.value };
      });

      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`
        : '';

      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📉</span>
              <span>{block.props.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              {isEditing ? '✕ Cancelar' : '⚙️ Editar datos'}
            </button>
          </div>

          {isEditing ? (
            <ChartEditorModal
              title={block.props.title}
              data={data}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="w-full overflow-hidden">
              <svg
                className="w-full h-auto overflow-hidden rounded-xl"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id={`gradient-${block.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Área bajo la curva */}
                {areaPath && <path d={areaPath} fill={`url(#gradient-${block.id})`} />}

                {/* Línea principal */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Puntos de datos y etiquetas */}
                {points.map((p, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill="#818cf8"
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-transform duration-200 group-hover:scale-150"
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {p.value}
                    </text>
                    <text
                      x={p.x}
                      y={svgHeight - 5}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 4. Donut Chart Block
// ----------------------------------------------------------------------------
export const ChartDonutBlock = createReactBlockSpec(
  {
    type: 'chartDonut',
    propSchema: {
      title: { default: 'Gráfico de Rosca (Donut)' },
      data: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [isEditing, setIsEditing] = useState(false);
      const data = safeParseData(block.props.data, [
        { label: 'Completado', value: 65 },
        { label: 'Pendiente', value: 35 },
      ]);

      const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
      const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

      const handleSave = (newTitle: string, newData: ChartDataItem[]) => {
        editor.updateBlock(block, {
          props: {
            title: newTitle,
            data: JSON.stringify(newData),
          },
        });
        setIsEditing(false);
      };

      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>🍩</span>
              <span>{block.props.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              {isEditing ? '✕ Cancelar' : '⚙️ Editar datos'}
            </button>
          </div>

          {isEditing ? (
            <ChartEditorModal
              title={block.props.title}
              data={data}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex items-center justify-around py-2 gap-4 flex-wrap">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--border-muted)"
                    strokeWidth="3.8"
                  />
                  {data.map((item, idx) => {
                    const pct = Math.round((item.value / total) * 100);
                    const color = colors[idx % colors.length];
                    return (
                      <path
                        key={idx}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={color}
                        strokeWidth="3.8"
                        strokeDasharray={`${pct}, 100`}
                      />
                    );
                  })}
                </svg>
                <div className="absolute text-center">
                  <div className="text-xs font-extrabold text-indigo-400">{total}</div>
                  <div className="text-[9px] text-[var(--text-secondary)] font-medium">Total</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-medium min-w-[120px]">
                {data.map((item, idx) => {
                  const pct = Math.round((item.value / total) * 100);
                  const color = colors[idx % colors.length];
                  return (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[var(--text-primary)] truncate">{item.label}</span>
                      </div>
                      <span className="font-mono text-[var(--text-secondary)] text-[11px]">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 5. Number Chart / Metric Card Block
// ----------------------------------------------------------------------------
export const ChartNumberBlock = createReactBlockSpec(
  {
    type: 'chartNumber',
    propSchema: {
      title: { default: 'Métrica Numérica' },
      data: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [isEditing, setIsEditing] = useState(false);
      const data = safeParseData(block.props.data, [
        { label: 'Crecimiento', value: 14.2 },
        { label: 'Total Acumulado', value: 45280 },
      ]);

      const mainVal = data[1]?.value ?? data[0]?.value ?? 45280;
      const trendVal = data[0]?.value ?? 14.2;

      const handleSave = (newTitle: string, newData: ChartDataItem[]) => {
        editor.updateBlock(block, {
          props: {
            title: newTitle,
            data: JSON.stringify(newData),
          },
        });
        setIsEditing(false);
      };

      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-2 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🔢</span>
              <span>{block.props.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              {isEditing ? '✕ Cancelar' : '⚙️ Editar datos'}
            </button>
          </div>

          {isEditing ? (
            <ChartEditorModal
              title={block.props.title}
              data={data}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-1 pt-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-indigo-400">
                  {typeof mainVal === 'number' ? mainVal.toLocaleString() : mainVal}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${trendVal >= 0
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}
                >
                  {trendVal >= 0 ? `▲ +${trendVal}%` : `▼ ${trendVal}%`}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono">Indicador clave de rendimiento</p>
            </div>
          )}
        </div>
      );
    },
  }
);
