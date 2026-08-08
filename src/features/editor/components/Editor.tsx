import { useEffect, useRef, useState } from 'react';
import { useCreateBlockNote, SuggestionMenuController } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems, type PartialBlock } from '@blocknote/core';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useUiStore } from '@/stores/useUiStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { API_BASE_URL, resolveImageUrl } from '@/core/config';
import { CalloutBlock } from '../blocks/CalloutBlock';
import { WebBookmarkBlock } from '../blocks/WebBookmarkBlock';
import {
  DatabaseTableBlock,
  DatabaseBoardBlock,
  DatabaseGalleryBlock,
  DatabaseListBlock,
  DatabaseFeedBlock,
  DatabaseDashboardBlock,
  DatabaseCalendarBlock,
  DatabaseTimelineBlock,
  DatabaseFormBlock,
} from '../blocks/DatabaseBlocks';
import {
  ChartVerticalBarBlock,
  ChartHorizontalBarBlock,
  ChartLineBlock,
  ChartDonutBlock,
  ChartNumberBlock,
} from '../blocks/ChartBlocks';
import { getNotionSlashMenuItems } from '../config/getNotionSlashMenuItems';
import '@blocknote/shadcn/style.css';

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    callout: CalloutBlock(),
    webBookmark: WebBookmarkBlock(),
    databaseTable: DatabaseTableBlock(),
    databaseBoard: DatabaseBoardBlock(),
    databaseGallery: DatabaseGalleryBlock(),
    databaseList: DatabaseListBlock(),
    databaseFeed: DatabaseFeedBlock(),
    databaseDashboard: DatabaseDashboardBlock(),
    databaseCalendar: DatabaseCalendarBlock(),
    databaseTimeline: DatabaseTimelineBlock(),
    databaseForm: DatabaseFormBlock(),
    chartVerticalBar: ChartVerticalBarBlock(),
    chartHorizontalBar: ChartHorizontalBarBlock(),
    chartLine: ChartLineBlock(),
    chartDonut: ChartDonutBlock(),
    chartNumber: ChartNumberBlock(),
  },
});

interface EditorProps {
  pageId: string;
  initialContent?: string;
  readOnly?: boolean;
  onContentChange: (content: string) => void;
  onProviderReady?: (provider: HocuspocusProvider | null) => void;
  onSavingStatusChange?: (status: 'saved' | 'saving') => void;
}

export const Editor = ({
  pageId,
  initialContent,
  readOnly = false,
  onContentChange,
  onProviderReady,
  onSavingStatusChange,
}: EditorProps) => {
  const { theme } = useUiStore();
  const { user, sessionToken } = useAuthStore();

  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);

  // Instanciar Y.Doc y HocuspocusProvider por cada página
  useEffect(() => {
    // No conectar hasta tener usuario y token de sesión
    if (!pageId || !user || !sessionToken) return;

    const doc = new Y.Doc();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname || 'localhost';
    const wsUrl =
      window.location.port === '5173'
        ? `${wsProtocol}//${wsHost}:1234`
        : `${wsProtocol}//${wsHost}${window.location.port ? `:${window.location.port}` : ''}/collab`;

    const hocusProvider = new HocuspocusProvider({
      url: wsUrl,
      name: pageId,
      document: doc,
      token: sessionToken,
    });

    // Configurar metadatos del usuario local en awareness para cursores y presencia
    if (hocusProvider.awareness) {
      hocusProvider.awareness.setLocalStateField('user', {
        id: user.id,
        name: user.username,
        username: user.username,
        color: user.color,
      });
    }

    setYdoc(doc);
    setProvider(hocusProvider);

    if (onProviderReady) {
      onProviderReady(hocusProvider);
    }

    return () => {
      if (onProviderReady) {
        onProviderReady(null);
      }
      hocusProvider.destroy();
      doc.destroy();
    };
  }, [pageId, user?.id, user?.username, user?.color, sessionToken]);


  const parseInitialContent = (): PartialBlock[] | undefined => {
    if (!initialContent) return undefined;
    try {
      const parsed = JSON.parse(initialContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as PartialBlock[];
      }
    } catch {
      // Fallback
    }
    return undefined;
  };

  const handleUploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Error al subir la imagen');
    }

    const data = await res.json();
    return resolveImageUrl(data.url);
  };

  // Crear editor de BlockNote con o sin colaboración
  const editor = useCreateBlockNote(
    provider && ydoc
      ? {
        schema,
        collaboration: {
          provider,
          fragment: ydoc.getXmlFragment('blocknote'),
          user: {
            name: user?.username || 'Anónimo',
            color: user?.color || '#6366f1',
          },
          showCursorLabels: 'activity',
        },
        uploadFile: handleUploadFile,
      }
      : {
        schema,
        initialContent: parseInitialContent(),
        uploadFile: handleUploadFile,
      },
    [provider, ydoc, user?.username, user?.color]
  );

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    isInitializedRef.current = false;
  }, [pageId]);

  const isBlockContentEmpty = (blocks: PartialBlock[] | null | undefined): boolean => {
    if (!blocks || blocks.length === 0) return true;
    if (blocks.length === 1) {
      const first = blocks[0];
      const type = first.type || 'paragraph';
      const content = first.content;
      if (type === 'paragraph') {
        if (!content) return true;
        if (Array.isArray(content) && content.length === 0) return true;
        if (typeof content === 'string' && content.trim() === '') return true;
      }
    }
    return false;
  };

  // Si el documento Yjs colaborativo está recién creado y vacío, sembrar con initialContent de SQLite
  useEffect(() => {
    if (!editor || !provider || !ydoc) return;

    const seedInitialContent = () => {
      if (isInitializedRef.current) return;
      const parsed = parseInitialContent();

      // Si el editor actual está vacío pero SQLite tiene contenido guardado, restaurarlo en Yjs/BlockNote
      if (isBlockContentEmpty(editor.document as PartialBlock[]) && parsed && !isBlockContentEmpty(parsed)) {
        try {
          editor.replaceBlocks(editor.document, parsed);
        } catch (err) {
          console.error('Error al inicializar contenido de la nota desde SQLite:', err);
        }
      }
      isInitializedRef.current = true;
    };

    provider.on('synced', seedInitialContent);
    if (provider.isSynced) {
      seedInitialContent();
    }

    return () => {
      provider.off('synced', seedInitialContent);
    };
  }, [editor, provider, ydoc, pageId, initialContent]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = () => {
    // Si no está inicializado (o está cargando el Yjs colaborativo), no guardar para evitar vaciado
    if (provider && !isInitializedRef.current) {
      return;
    }

    if (onSavingStatusChange) {
      onSavingStatusChange('saving');
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Autoguardado ultra rápido a 150ms (estilo Google Docs / Notion)
    debounceTimerRef.current = setTimeout(() => {
      const jsonContent = JSON.stringify(editor.document);
      onContentChange(jsonContent);
      if (onSavingStatusChange) {
        onSavingStatusChange('saved');
      }
    }, 150);
  };

  return (
    <div className="w-full min-h-[400px] text-[var(--text-primary)]">
      <BlockNoteView
        editor={editor}
        editable={!readOnly}
        onChange={handleChange}
        theme={theme === 'light' ? 'light' : 'dark'}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(getNotionSlashMenuItems(editor), query)
          }
        />
      </BlockNoteView>
    </div>
  );
};
