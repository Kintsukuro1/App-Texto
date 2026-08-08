import { useState } from 'react';
import { createReactBlockSpec } from '@blocknote/react';

// ----------------------------------------------------------------------------
// 1. Table View Block
// ----------------------------------------------------------------------------
export const DatabaseTableBlock = createReactBlockSpec(
  {
    type: 'databaseTable',
    propSchema: { title: { default: 'Tabla de datos' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const [rows, setRows] = useState([
        { id: '1', name: 'Tarea Alpha', status: 'En Progreso', priority: 'Alta' },
        { id: '2', name: 'Diseño UI/UX', status: 'Completado', priority: 'Media' },
        { id: '3', name: 'Revisión backend', status: 'Pendiente', priority: 'Baja' },
      ]);

      const addRow = () => {
        setRows([
          ...rows,
          { id: String(Date.now()), name: 'Nueva fila', status: 'Pendiente', priority: 'Media' },
        ]);
      };

      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📊</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Vista Tabla
              </span>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="px-2.5 py-1 text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              + Nueva fila
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-muted)] text-[var(--text-secondary)]">
                  <th className="py-2 px-3 font-semibold">Nombre</th>
                  <th className="py-2 px-3 font-semibold">Estado</th>
                  <th className="py-2 px-3 font-semibold">Prioridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)]/50">
                {rows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                    <td className="py-2 px-3 font-medium text-[var(--text-primary)]">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].name = e.target.value;
                          setRows(updated);
                        }}
                        className="bg-transparent outline-none w-full text-[var(--text-primary)] focus:border-b focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === 'Completado'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : r.status === 'En Progreso'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-slate-500/15 text-slate-400'
                          }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[var(--text-secondary)] font-mono text-[11px]">{r.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 2. Board View Block (Kanban)
// ----------------------------------------------------------------------------
export const DatabaseBoardBlock = createReactBlockSpec(
  {
    type: 'databaseBoard',
    propSchema: { title: { default: 'Tablero Kanban' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const columns = [
        { id: 'todo', title: '📋 Por hacer', cards: ['Diseñar mockups', 'Investigar API'] },
        { id: 'doing', title: '🚀 En progreso', cards: ['Implementar componentes'] },
        { id: 'done', title: '✅ Listo', cards: ['Configurar base de datos'] },
      ];

      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>🗂️</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Vista Tablero
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {columns.map((col) => (
              <div key={col.id} className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-muted)] space-y-2">
                <div className="text-xs font-semibold text-[var(--text-secondary)]">{col.title}</div>
                <div className="space-y-1.5">
                  {col.cards.map((c, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-muted)] text-xs font-medium text-[var(--text-primary)] shadow-sm hover:border-indigo-500/40 transition-all cursor-pointer"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 3. Gallery View Block
// ----------------------------------------------------------------------------
export const DatabaseGalleryBlock = createReactBlockSpec(
  {
    type: 'databaseGallery',
    propSchema: { title: { default: 'Galería visual' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const items = [
        { id: '1', title: 'Proyecto Alpha', tag: 'Diseño', color: 'from-indigo-600 to-violet-600' },
        { id: '2', title: 'Lanzamiento v2.0', tag: 'Estrategia', color: 'from-cyan-600 to-blue-600' },
        { id: '3', title: 'Guía de Estilo', tag: 'Branding', color: 'from-rose-600 to-pink-600' },
      ];

      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>🖼️</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                Vista Galería
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] hover:border-indigo-500/40 rounded-xl space-y-2 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5"
              >
                <div className={`h-20 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-extrabold text-lg shadow-inner`}>
                  {item.title.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </div>
                  <span className="inline-block text-[9px] px-2 py-0.2 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {item.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 4. List View Block
// ----------------------------------------------------------------------------
export const DatabaseListBlock = createReactBlockSpec(
  {
    type: 'databaseList',
    propSchema: { title: { default: 'Lista comprimida' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const items = [
        { id: '1', title: 'Reunión de equipo semanal', date: 'Hoy, 10:00 AM', tag: 'Evento' },
        { id: '2', title: 'Revisar PR #42 en GitHub', date: 'Ayer', tag: 'Dev' },
        { id: '3', title: 'Actualizar documentación', date: 'Mañana', tag: 'Docs' },
      ];

      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📜</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Vista Lista
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-muted)] hover:border-indigo-500/40 rounded-xl flex items-center justify-between text-xs font-medium transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>📄</span>
                  <span className="text-[var(--text-primary)] truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] shrink-0">
                  <span className="px-2 py-0.2 rounded-full bg-indigo-500/10 text-indigo-300">{item.tag}</span>
                  <span className="font-mono">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 5. Feed View Block
// ----------------------------------------------------------------------------
export const DatabaseFeedBlock = createReactBlockSpec(
  {
    type: 'databaseFeed',
    propSchema: { title: { default: 'Feed de actividades' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const posts = [
        { id: '1', user: 'Felipe', action: 'creó la nota "Plan Estratégico 2026"', time: 'Hace 5 min', avatar: 'F' },
        { id: '2', user: 'Ana', action: 'comentó en "Sprint Backlog"', time: 'Hace 20 min', avatar: 'A' },
      ];

      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📰</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Vista Feed
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl flex items-start gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {p.avatar}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="text-[var(--text-primary)]">
                    <span className="font-bold">{p.user}</span> {p.action}
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{p.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 6. Dashboard View Block
// ----------------------------------------------------------------------------
export const DatabaseDashboardBlock = createReactBlockSpec(
  {
    type: 'databaseDashboard',
    propSchema: { title: { default: 'Panel de Control (Dashboard)' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>🖥️</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Vista Dashboard
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl space-y-1">
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">Notas Totales</span>
              <div className="text-xl font-extrabold text-indigo-400">24</div>
            </div>
            <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl space-y-1">
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">Tareas Resueltas</span>
              <div className="text-xl font-extrabold text-emerald-400">89%</div>
            </div>
            <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl space-y-1">
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">Colaboradores</span>
              <div className="text-xl font-extrabold text-violet-400">5 en línea</div>
            </div>
          </div>
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 7. Calendar View Block
// ----------------------------------------------------------------------------
export const DatabaseCalendarBlock = createReactBlockSpec(
  {
    type: 'databaseCalendar',
    propSchema: { title: { default: 'Calendario' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const days = Array.from({ length: 14 }, (_, i) => i + 1);

      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📅</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Vista Calendario
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="p-1 font-semibold text-[var(--text-secondary)] text-[10px]">{d}</div>
            ))}
            {days.map((d) => (
              <div
                key={d}
                className={`p-2 min-h-[44px] rounded-lg border text-left text-[11px] font-medium flex flex-col justify-between ${d === 6
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-[var(--bg-primary)] border-[var(--border-muted)] text-[var(--text-primary)]'
                  }`}
              >
                <span>{d}</span>
                {d === 6 && <span className="text-[9px] bg-indigo-600 text-white px-1 rounded truncate">Sprint Review</span>}
              </div>
            ))}
          </div>
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 8. Timeline View Block
// ----------------------------------------------------------------------------
export const DatabaseTimelineBlock = createReactBlockSpec(
  {
    type: 'databaseTimeline',
    propSchema: { title: { default: 'Línea de Tiempo (Gantt)' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const items = [
        { name: 'Fase 1: Investigación', start: '0%', width: '40%', color: 'bg-indigo-500' },
        { name: 'Fase 2: Desarrollo UI', start: '30%', width: '50%', color: 'bg-violet-500' },
        { name: 'Fase 3: Pruebas QA', start: '70%', width: '30%', color: 'bg-emerald-500' },
      ];

      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>⏳</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                Vista Timeline
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[11px] font-semibold text-[var(--text-primary)]">{item.name}</div>
                <div className="w-full h-4 bg-[var(--bg-primary)] rounded-full border border-[var(--border-muted)] relative overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full absolute transition-all opacity-80`}
                    style={{ left: item.start, width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  }
);

// ----------------------------------------------------------------------------
// 9. Form Block
// ----------------------------------------------------------------------------
export const DatabaseFormBlock = createReactBlockSpec(
  {
    type: 'databaseForm',
    propSchema: { title: { default: 'Formulario de entrada' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const [submitted, setSubmitted] = useState(false);

      return (
        <div className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📋</span>
              <span>{block.props.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Formulario
              </span>
            </div>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 text-center font-medium">
              ✅ ¡Respuesta enviada con éxito!
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-2.5 text-xs"
            >
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Nombre completo</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre..."
                  className="w-full p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Detalles / Mensaje</label>
                <textarea
                  rows={2}
                  placeholder="Escribe tus comentarios..."
                  className="w-full p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Enviar respuesta
              </button>
            </form>
          )}
        </div>
      );
    },
  }
);
