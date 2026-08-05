import type { PartialBlock } from '@blocknote/core';

/**
 * Parsea el contenido de un archivo Markdown (.md) a bloques de BlockNote
 */
export const parseMarkdownToBlocks = (mdText: string): { title: string; blocks: PartialBlock[] } => {
  const lines = mdText.split(/\r?\n/);
  let title = 'Nota Importada';
  const blocks: PartialBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detectar título principal
    if (line.startsWith('# ') && title === 'Nota Importada') {
      title = line.replace(/^#\s+/, '').trim();
      continue;
    }

    // Encabezados (#, ##, ###)
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length as 1 | 2 | 3;
        blocks.push({
          type: 'heading',
          props: { level },
          content: match[2],
        });
        continue;
      }
    }

    // Listas desordenadas (- o *)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        type: 'bulletListItem',
        content: line.replace(/^[-*]\s+/, ''),
      });
      continue;
    }

    // Listas ordenadas (1. 2.)
    if (/^\d+\.\s+/.test(line)) {
      blocks.push({
        type: 'numberedListItem',
        content: line.replace(/^\d+\.\s+/, ''),
      });
      continue;
    }

    // Párrafo por defecto
    blocks.push({
      type: 'paragraph',
      content: line,
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      type: 'paragraph',
      content: 'Contenido importado...',
    });
  }

  return { title, blocks };
};
