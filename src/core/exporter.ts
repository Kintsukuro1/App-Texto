import type { Page } from '@/types/page';

/**
 * Convierte el contenido en formato JSON de BlockNote a Markdown plano (.md)
 */
export const convertBlocksToMarkdown = (title: string, contentJson: string): string => {
  let md = `# ${title || 'Sin título'}\n\n`;

  if (!contentJson) return md;

  try {
    const blocks = JSON.parse(contentJson);
    if (Array.isArray(blocks)) {
      for (const block of blocks) {
        const text = extractBlockText(block);
        const type = block.type || 'paragraph';

        switch (type) {
          case 'heading':
            const level = block.props?.level || 1;
            md += `${'#'.repeat(level)} ${text}\n\n`;
            break;
          case 'bulletListItem':
            md += `- ${text}\n`;
            break;
          case 'numberedListItem':
            md += `1. ${text}\n`;
            break;
          case 'checkListItem':
            const checked = block.props?.checked ? 'x' : ' ';
            md += `- [${checked}] ${text}\n`;
            break;
          case 'codeBlock':
            md += `\`\`\`\n${text}\n\`\`\`\n\n`;
            break;
          default:
            if (text.trim()) {
              md += `${text}\n\n`;
            }
            break;
        }
      }
    }
  } catch {
    md += contentJson;
  }

  return md;
};

const extractBlockText = (block: { content?: Array<{ text?: string }> | string }): string => {
  if (!block || !block.content) return '';
  if (typeof block.content === 'string') return block.content;
  if (Array.isArray(block.content)) {
    return block.content.map((c) => c.text || '').join('');
  }
  return '';
};

/**
 * Descarga una nota en formato Markdown (.md)
 */
export const exportPageAsMarkdown = (page: Page): void => {
  const mdContent = convertBlocksToMarkdown(page.title, page.content);
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = (page.title || 'nota').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${fileName}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Descarga una nota en formato HTML (.html) estilizado
 */
export const exportPageAsHTML = (page: Page): void => {
  const mdContent = convertBlocksToMarkdown(page.title, page.content);
  const htmlDoc = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${page.title || 'Nota'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #1a1d23; color: #e2e8f0; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #818cf8; border-bottom: 1px solid #334155; padding-bottom: 10px; }
    pre { background: #0f172a; padding: 15px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <h1>${page.title || 'Sin título'}</h1>
  <pre>${mdContent}</pre>
</body>
</html>`;

  const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = (page.title || 'nota').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${fileName}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
