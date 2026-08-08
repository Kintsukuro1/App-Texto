import {
  insertOrUpdateBlockForSlashMenu,
  FilePanelExtension,
  SuggestionMenu,
} from '@blocknote/core';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { useNotesStore } from '@/stores/useNotesStore';
import { useUiStore } from '@/stores/useUiStore';

export function getNotionSlashMenuItems(editor: any): DefaultReactSuggestionItem[] {
  const { createSubPage } = useNotesStore.getState();
  const { setSearchOpen } = useUiStore.getState();

  return [
    // =========================================================================
    // BLOQUES BÁSICOS
    // =========================================================================
    {
      title: 'Text',
      subtext: 'Párrafo de texto normal',
      aliases: ['text', 'parrafo', 'p', 'texto'],
      group: 'Bloques básicos',
      icon: <span>💬</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'paragraph' });
      },
    },
    {
      title: 'Heading 1',
      subtext: 'Encabezado de sección grande (H1)',
      aliases: ['h1', 'heading 1', 'titulo 1'],
      group: 'Bloques básicos',
      icon: <span className="font-bold">H1</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'heading',
          props: { level: 1 },
        } as any);
      },
    },
    {
      title: 'Heading 2',
      subtext: 'Encabezado de sección mediano (H2)',
      aliases: ['h2', 'heading 2', 'titulo 2'],
      group: 'Bloques básicos',
      icon: <span className="font-bold">H2</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'heading',
          props: { level: 2 },
        } as any);
      },
    },
    {
      title: 'Heading 3',
      subtext: 'Encabezado de subsección pequeño (H3)',
      aliases: ['h3', 'heading 3', 'titulo 3'],
      group: 'Bloques básicos',
      icon: <span className="font-bold">H3</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'heading',
          props: { level: 3 },
        } as any);
      },
    },
    {
      title: 'Heading 4',
      subtext: 'Encabezado compacto de subsección (H4)',
      aliases: ['h4', 'heading 4', 'titulo 4'],
      group: 'Bloques básicos',
      icon: <span className="font-bold">H4</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'heading',
          props: { level: 3 },
        } as any);
      },
    },
    {
      title: 'Bulleted list',
      subtext: 'Crear una lista con viñetas simple',
      aliases: ['bulleted list', 'list', 'vineta', 'ul'],
      group: 'Bloques básicos',
      icon: <span>•</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'bulletListItem' });
      },
    },
    {
      title: 'Numbered list',
      subtext: 'Crear una lista numerada en orden',
      aliases: ['numbered list', 'numero', 'ol'],
      group: 'Bloques básicos',
      icon: <span>1.</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'numberedListItem' });
      },
    },
    {
      title: 'To-do list',
      subtext: 'Lista de tareas con casillas de verificación',
      aliases: ['to-do list', 'todo', 'task', 'tarea', 'checkbox'],
      group: 'Bloques básicos',
      icon: <span>☑</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'checkListItem' });
      },
    },
    {
      title: 'Toggle list',
      subtext: 'Lista o bloque desplegable ocultable',
      aliases: ['toggle list', 'toggle', 'desplegable'],
      group: 'Bloques básicos',
      icon: <span>▶</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'toggleListItem' } as any);
      },
    },
    {
      title: 'Page',
      subtext: 'Crear una nueva sub-página dentro de esta',
      aliases: ['page', 'pagina', 'subpagina'],
      group: 'Bloques básicos',
      icon: <span>📄</span>,
      onItemClick: async () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'paragraph' });
        const activeId = useNotesStore.getState().activePageId;
        if (activeId) {
          await createSubPage(activeId, 'Nueva sub-página');
        }
      },
    },
    {
      title: 'Callout',
      subtext: 'Caja destacada con emoji y fondo de color',
      aliases: ['callout', 'destacado', 'alerta', 'nota'],
      group: 'Bloques básicos',
      icon: <span>💡</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'callout' } as any);
      },
    },
    {
      title: 'Quote',
      subtext: 'Capturar una cita o texto resaltado',
      aliases: ['quote', 'cita'],
      group: 'Bloques básicos',
      icon: <span>“</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'quote' } as any);
      },
    },
    {
      title: 'Table',
      subtext: 'Insertar una tabla simple',
      aliases: ['table', 'tabla'],
      group: 'Bloques básicos',
      icon: <span>田</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'table',
          content: {
            type: 'tableContent',
            rows: [
              { cells: ['', '', ''] },
              { cells: ['', '', ''] },
            ],
          } as any,
        });
      },
    },
    {
      title: 'Divider',
      subtext: 'Línea horizontal para separar secciones',
      aliases: ['divider', 'divisor', 'linea', 'hr'],
      group: 'Bloques básicos',
      icon: <span>—</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'divider' } as any);
      },
    },
    {
      title: 'Link to page',
      subtext: 'Enlazar a una página existente de tu espacio',
      aliases: ['link to page', 'link', 'enlace', 'mencion'],
      group: 'Bloques básicos',
      icon: <span>🔗</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'paragraph' });
        setSearchOpen(true);
      },
    },
    {
      title: 'Emoji',
      subtext: 'Buscador y selector de emojis',
      aliases: ['emoji', 'emoticon', 'carita'],
      group: 'Bloques básicos',
      icon: <span>😀</span>,
      onItemClick: () => {
        editor.getExtension(SuggestionMenu)?.openSuggestionMenu(':', {
          deleteTriggerCharacter: true,
          ignoreQueryLength: true,
        });
      },
    },

    // =========================================================================
    // MULTIMEDIA Y ARCHIVOS
    // =========================================================================
    {
      title: 'Image',
      subtext: 'Subir o pegar el enlace de una imagen / GIF',
      aliases: ['image', 'imagen', 'foto', 'gif'],
      group: 'Media',
      icon: <span>🖼️</span>,
      onItemClick: () => {
        const insertedBlock = insertOrUpdateBlockForSlashMenu(editor, { type: 'image' });
        if (insertedBlock?.id) {
          editor.getExtension(FilePanelExtension)?.showMenu(insertedBlock.id);
        }
      },
    },
    {
      title: 'Video',
      subtext: 'Incrustar un video o subir archivo mp4',
      aliases: ['video', 'pelicula', 'youtube'],
      group: 'Media',
      icon: <span>🎥</span>,
      onItemClick: () => {
        const insertedBlock = insertOrUpdateBlockForSlashMenu(editor, { type: 'video' });
        if (insertedBlock?.id) {
          editor.getExtension(FilePanelExtension)?.showMenu(insertedBlock.id);
        }
      },
    },
    {
      title: 'Audio',
      subtext: 'Incrustar archivo o grabación de audio mp3',
      aliases: ['audio', 'musica', 'podcast', 'sonido'],
      group: 'Media',
      icon: <span>🎵</span>,
      onItemClick: () => {
        const insertedBlock = insertOrUpdateBlockForSlashMenu(editor, { type: 'audio' });
        if (insertedBlock?.id) {
          editor.getExtension(FilePanelExtension)?.showMenu(insertedBlock.id);
        }
      },
    },
    {
      title: 'Code',
      subtext: 'Bloque de código con resaltado de sintaxis',
      aliases: ['code', 'codigo', 'developer', 'script'],
      group: 'Media',
      icon: <span>💻</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'codeBlock' });
      },
    },
    {
      title: 'File',
      subtext: 'Adjuntar un archivo o documento (PDF, Zip...)',
      aliases: ['file', 'archivo', 'adjunto', 'documento'],
      group: 'Media',
      icon: <span>📁</span>,
      onItemClick: () => {
        const insertedBlock = insertOrUpdateBlockForSlashMenu(editor, { type: 'file' });
        if (insertedBlock?.id) {
          editor.getExtension(FilePanelExtension)?.showMenu(insertedBlock.id);
        }
      },
    },
    {
      title: 'Web bookmark',
      subtext: 'Crear una tarjeta previa para una URL web',
      aliases: ['web bookmark', 'bookmark', 'marcador', 'url'],
      group: 'Media',
      icon: <span>🔖</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'webBookmark' } as any);
      },
    },

    // =========================================================================
    // BASES DE DATOS Y VISTAS
    // =========================================================================
    {
      title: 'Table view',
      subtext: 'Vista de base de datos en formato tabla',
      aliases: ['table view', 'vista tabla', 'database table'],
      group: 'Bases de datos',
      icon: <span>📊</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseTable' } as any);
      },
    },
    {
      title: 'Board view',
      subtext: 'Vista de tablero Kanban por columnas',
      aliases: ['board view', 'kanban', 'tablero'],
      group: 'Bases de datos',
      icon: <span>🗂️</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseBoard' } as any);
      },
    },
    {
      title: 'Gallery view',
      subtext: 'Vista de galería con portadas y tarjetas',
      aliases: ['gallery view', 'galeria', 'tarjetas'],
      group: 'Bases de datos',
      icon: <span>🖼️</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseGallery' } as any);
      },
    },
    {
      title: 'List view',
      subtext: 'Vista de lista simple para tareas o elementos',
      aliases: ['list view', 'vista lista'],
      group: 'Bases de datos',
      icon: <span>📜</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseList' } as any);
      },
    },
    {
      title: 'Feed view',
      subtext: 'Vista de flujo continuo o feed de publicaciones',
      aliases: ['feed view', 'feed', 'actividad'],
      group: 'Bases de datos',
      icon: <span>📰</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseFeed' } as any);
      },
    },
    {
      title: 'Dashboard view',
      subtext: 'Panel de control con métricas resumen',
      aliases: ['dashboard view', 'dashboard', 'panel'],
      group: 'Bases de datos',
      icon: <span>🖥️</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseDashboard' } as any);
      },
    },
    {
      title: 'Calendar view',
      subtext: 'Vista de calendario mensual para eventos',
      aliases: ['calendar view', 'calendario', 'fechas'],
      group: 'Bases de datos',
      icon: <span>📅</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseCalendar' } as any);
      },
    },
    {
      title: 'Timeline view',
      subtext: 'Vista de cronograma / línea de tiempo Gantt',
      aliases: ['timeline view', 'timeline', 'cronograma', 'gantt'],
      group: 'Bases de datos',
      icon: <span>⏳</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseTimeline' } as any);
      },
    },
    {
      title: 'Database - inline',
      subtext: 'Insertar una base de datos integrada en la página',
      aliases: ['database - inline', 'database inline', 'bd en linea'],
      group: 'Bases de datos',
      icon: <span>📦</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseTable' } as any);
      },
    },
    {
      title: 'Database - full page',
      subtext: 'Crear una base de datos en una nueva página',
      aliases: ['database - full page', 'database full page', 'bd completa'],
      group: 'Bases de datos',
      icon: <span>🏛️</span>,
      onItemClick: async () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'paragraph' });
        const activeId = useNotesStore.getState().activePageId;
        if (activeId) {
          await createSubPage(activeId, '📊 Base de Datos');
        }
      },
    },
    {
      title: 'Linked view of data source',
      subtext: 'Vincular una vista existente a una fuente de datos',
      aliases: ['linked view of data source', 'linked view', 'vista vinculada'],
      group: 'Bases de datos',
      icon: <span>🔗</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseTable' } as any);
      },
    },

    // =========================================================================
    // GRÁFICOS Y VISUALIZACIONES
    // =========================================================================
    {
      title: 'Vertical bar chart',
      subtext: 'Gráfico de barras verticales interactivas',
      aliases: ['vertical bar chart', 'bar chart', 'grafico barras'],
      group: 'Gráficos y Visualización',
      icon: <span>📊</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'chartVerticalBar' } as any);
      },
    },
    {
      title: 'Horizontal bar chart',
      subtext: 'Gráfico de barras horizontales comparativas',
      aliases: ['horizontal bar chart', 'grafico horizontal'],
      group: 'Gráficos y Visualización',
      icon: <span>📈</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'chartHorizontalBar' } as any);
      },
    },
    {
      title: 'Line chart',
      subtext: 'Gráfico de líneas para tendencias en el tiempo',
      aliases: ['line chart', 'line chrat', 'grafico lineas', 'tendencia'],
      group: 'Gráficos y Visualización',
      icon: <span>📉</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'chartLine' } as any);
      },
    },
    {
      title: 'Donut chart',
      subtext: 'Gráfico de rosca / pastel para proporciones',
      aliases: ['donut chart', 'grafico rosca', 'pie chart'],
      group: 'Gráficos y Visualización',
      icon: <span>🍩</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'chartDonut' } as any);
      },
    },
    {
      title: 'Number chart',
      subtext: 'Tarjeta de métrica o indicador KPI destacado',
      aliases: ['number chart', 'metrica', 'kpi', 'numero'],
      group: 'Gráficos y Visualización',
      icon: <span>🔢</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'chartNumber' } as any);
      },
    },
    {
      title: 'Form',
      subtext: 'Formulario para recolectar respuestas e información',
      aliases: ['form', 'formulario', 'encuesta'],
      group: 'Gráficos y Visualización',
      icon: <span>📋</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseForm' } as any);
      },
    },
  ];
}
