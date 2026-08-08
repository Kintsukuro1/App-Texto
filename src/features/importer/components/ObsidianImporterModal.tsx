import { useState, useRef } from 'react';
import { useNotesStore } from '@/stores/useNotesStore';
import { parseMarkdownToBlocks } from '@/core/importer';

interface ObsidianImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ObsidianImporterModal = ({ isOpen, onClose }: ObsidianImporterModalProps) => {
  const { createPage } = useNotesStore();
  const [isImporting, setIsImporting] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const processFiles = async (filesList: FileList) => {
    const mdFiles = Array.from(filesList).filter(
      (f) => f.name.endsWith('.md') || f.name.endsWith('.txt')
    );

    if (mdFiles.length === 0) {
      alert('No se encontraron archivos Markdown (.md) en la selección.');
      return;
    }

    setIsImporting(true);
    setImportedCount(null);
    setProgressText(`Analizando ${mdFiles.length} archivos...`);

    // Mapa para asociar rutas de directorio con IDs de páginas padre
    const folderToPageIdMap: Record<string, string> = {};
    let count = 0;

    for (let i = 0; i < mdFiles.length; i++) {
      const file = mdFiles[i];
      setProgressText(`Importando ${i + 1}/${mdFiles.length}: ${file.name}`);

      const text = await file.text();
      const relativePath = file.webkitRelativePath || file.name;
      const pathParts = relativePath.split('/');

      let parentId: string | null = null;

      // Reconstruir la jerarquía de carpetas padre
      if (pathParts.length > 1) {
        let currentFolderPath = '';
        for (let p = 0; p < pathParts.length - 1; p++) {
          const folderName = pathParts[p];
          currentFolderPath = currentFolderPath ? `${currentFolderPath}/${folderName}` : folderName;

          if (!folderToPageIdMap[currentFolderPath]) {
            // Crear página contenedora para la carpeta
            const createdFolderPage = await createPage(
              `📁 ${folderName}`,
              JSON.stringify([
                {
                  type: 'heading',
                  props: { level: 2 },
                  content: [{ type: 'text', text: `Carpeta: ${folderName}` }],
                },
              ]),
              parentId
            );
            if (createdFolderPage) {
              folderToPageIdMap[currentFolderPath] = createdFolderPage.id;
              parentId = createdFolderPage.id;
            }
          } else {
            parentId = folderToPageIdMap[currentFolderPath];
          }
        }
      }

      // Parsea y crea la nota individual
      const { title: parsedTitle, blocks } = parseMarkdownToBlocks(text);
      const title = parsedTitle !== 'Nota Importada' ? parsedTitle : file.name.replace(/\.(md|txt)$/, '');
      await createPage(title, JSON.stringify(blocks), parentId);
      count++;
    }

    setIsImporting(false);
    setImportedCount(count);
    setProgressText(`¡Se importaron ${count} notas correctamente!`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-muted)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Importar Vault de Obsidian / Carpetas .md
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Convierte tus notas y estructura de carpetas de Obsidian a Notion Local.
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

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-[var(--bg-primary)]">
          {isImporting ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-indigo-300">{progressText}</p>
            </div>
          ) : (
            <>
              {importedCount !== null && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <span>✅</span>
                  <span>{progressText}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opción 1: Seleccionar Carpeta / Vault entero */}
                <div
                  onClick={() => folderInputRef.current?.click()}
                  className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-muted)] hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all cursor-pointer text-center space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mx-auto group-hover:scale-110 transition-transform">
                    📁
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                      Seleccionar Carpeta / Vault
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                      Conserva la jerarquía de sub-carpetas automáticamente.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={folderInputRef}
                    // @ts-expect-error webkitdirectory es soportado por navegadores modernos
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && processFiles(e.target.files)}
                  />
                </div>

                {/* Opción 2: Seleccionar Múltiples Archivos .md */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-muted)] hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all cursor-pointer text-center space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mx-auto group-hover:scale-110 transition-transform">
                    📄
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                      Seleccionar Archivos .md
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                      Elige uno o varios archivos Markdown individuales.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".md,.txt"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && processFiles(e.target.files)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-muted)] bg-[var(--bg-surface)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)]">Soporta Markdown estándar y jerarquías Obsidian</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--border-muted)] text-[var(--text-primary)] border border-[var(--border-muted)] font-medium cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
