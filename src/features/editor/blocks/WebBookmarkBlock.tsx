import { useState } from 'react';
import { createReactBlockSpec } from '@blocknote/react';

export const WebBookmarkBlock = createReactBlockSpec(
  {
    type: 'webBookmark',
    propSchema: {
      url: { default: '' },
      title: { default: '' },
      description: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [inputUrl, setInputUrl] = useState(block.props.url || '');

      const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputUrl.trim()) return;

        let cleanUrl = inputUrl.trim();
        if (!/^https?:\/\//i.test(cleanUrl)) {
          cleanUrl = `https://${cleanUrl}`;
        }

        let extractedDomain = '';
        try {
          extractedDomain = new URL(cleanUrl).hostname;
        } catch {
          extractedDomain = cleanUrl;
        }

        editor.updateBlock(block, {
          props: {
            url: cleanUrl,
            title: extractedDomain || 'Enlace Web',
            description: `Bookmark para ${cleanUrl}`,
          },
        });
      };

      if (!block.props.url) {
        return (
          <div contentEditable={false} className="w-full my-2 p-3 bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-xl text-xs space-y-2 select-none">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
              <span>🔖</span>
              <span>Añadir marcador web (Web Bookmark)</span>
            </div>
            <form onSubmit={handleSave} className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Pega un enlace (https://...)"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer transition-colors"
              >
                Crear marcador
              </button>
            </form>
          </div>
        );
      }

      let domain = '';
      try {
        domain = new URL(block.props.url).hostname;
      } catch {
        domain = block.props.url;
      }

      return (
        <div contentEditable={false} className="w-full my-2 p-4 bg-[var(--bg-surface)] border border-[var(--border-muted)] hover:border-indigo-500/40 rounded-2xl shadow-sm transition-all flex items-center justify-between gap-4 select-none group">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors truncate">
              <span>🌐</span>
              <span className="truncate">{block.props.title || domain}</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">
              {block.props.description || block.props.url}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono pt-1">
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt="Favicon"
                className="w-3.5 h-3.5 rounded shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="truncate">{domain}</span>
            </div>
          </div>

          <a
            href={block.props.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-primary)] hover:bg-indigo-600 text-[var(--text-secondary)] hover:text-white text-xs font-medium border border-[var(--border-muted)] hover:border-indigo-500 transition-all shrink-0 cursor-pointer"
          >
            Abrir ↗
          </a>
        </div>
      );
    },
  }
);
