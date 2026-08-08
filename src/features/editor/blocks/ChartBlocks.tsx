import { createReactBlockSpec } from '@blocknote/react';

// ----------------------------------------------------------------------------
// 1. Vertical Bar Chart Block
// ----------------------------------------------------------------------------
export const ChartVerticalBarBlock = createReactBlockSpec(
  {
    type: 'chartVerticalBar',
    propSchema: { title: { default: 'Gráfico de Barras Verticales' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const data = [
        { label: 'Ene', value: 45, color: 'bg-indigo-500' },
        { label: 'Feb', value: 70, color: 'bg-violet-500' },
        { label: 'Mar', value: 30, color: 'bg-cyan-500' },
        { label: 'Abr', value: 85, color: 'bg-emerald-500' },
        { label: 'May', value: 60, color: 'bg-amber-500' },
      ];

      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📊</span>
              <span>{block.props.title}</span>
            </div>
          </div>

          <div className="flex items-end justify-around h-36 pt-4 border-b border-[var(--border-muted)] px-2">
            {data.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 group w-10">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] group-hover:text-indigo-300 transition-colors">
                  {item.value}
                </span>
                <div
                  className={`w-full ${item.color} rounded-t-md transition-all duration-300 group-hover:brightness-125`}
                  style={{ height: `${item.value}%` }}
                />
                <span className="text-[10px] font-medium text-[var(--text-secondary)] mt-1">{item.label}</span>
              </div>
            ))}
          </div>
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
    propSchema: { title: { default: 'Gráfico de Barras Horizontales' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      const data = [
        { label: 'Diseño UI', value: '80%', color: 'bg-indigo-500' },
        { label: 'Desarrollo API', value: '65%', color: 'bg-violet-500' },
        { label: 'Testing QA', value: '40%', color: 'bg-cyan-500' },
        { label: 'Despliegue', value: '90%', color: 'bg-emerald-500' },
      ];

      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📈</span>
              <span>{block.props.title}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {data.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-[var(--text-primary)]">{item.label}</span>
                  <span className="font-mono text-[var(--text-secondary)]">{item.value}</span>
                </div>
                <div className="w-full h-3 bg-[var(--bg-primary)] rounded-full border border-[var(--border-muted)] overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-300`} style={{ width: item.value }} />
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
// 3. Line Chart Block
// ----------------------------------------------------------------------------
export const ChartLineBlock = createReactBlockSpec(
  {
    type: 'chartLine',
    propSchema: { title: { default: 'Gráfico de Líneas' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>📉</span>
              <span>{block.props.title}</span>
            </div>
          </div>

          <div className="relative h-32 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path
                d="M 0,80 Q 75,20 150,50 T 300,10"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="0" cy="80" r="4" fill="#6366f1" />
              <circle cx="75" cy="35" r="4" fill="#6366f1" />
              <circle cx="150" cy="50" r="4" fill="#6366f1" />
              <circle cx="225" cy="25" r="4" fill="#6366f1" />
              <circle cx="300" cy="10" r="4" fill="#6366f1" />
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-[var(--text-secondary)] mt-2">
              <span>Ene</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>May</span>
            </div>
          </div>
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
    propSchema: { title: { default: 'Gráfico de Rosca (Donut)' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <span>🍩</span>
              <span>{block.props.title}</span>
            </div>
          </div>

          <div className="flex items-center justify-around py-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--border-muted)"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3.8"
                  strokeDasharray="65, 100"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-indigo-400">65%</span>
            </div>

            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-[var(--text-primary)]">Completado (65%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-muted)]" />
                <span className="text-[var(--text-secondary)]">Pendiente (35%)</span>
              </div>
            </div>
          </div>
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
    propSchema: { title: { default: 'Métrica Numérica' } },
    content: 'none',
  },
  {
    render: ({ block }) => {
      return (
        <div contentEditable={false} className="w-full my-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-md space-y-1 select-none">
          <div className="text-xs font-medium text-[var(--text-secondary)]">{block.props.title}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400">$45,280</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ▲ +14.2%
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-mono">Vs. mes anterior</p>
        </div>
      );
    },
  }
);
