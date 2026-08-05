import { useEffect, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import type { PartialBlock } from '@blocknote/core';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useUiStore } from '@/stores/useUiStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import '@blocknote/shadcn/style.css';

interface EditorProps {
  pageId: string;
  initialContent?: string;
  onContentChange: (content: string) => void;
  onProviderReady?: (provider: HocuspocusProvider | null) => void;
}

export const Editor = ({
  pageId,
  initialContent,
  onContentChange,
  onProviderReady,
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
    const hocusProvider = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: pageId,
      document: doc,
      // Pasar el token directamente — Hocuspocus lo envía como header Authentication
      // en el handshake WS, solucionando el problema de cookies entre puertos en Electron
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

  // Crear editor de BlockNote con o sin colaboración
  const editor = useCreateBlockNote(
    provider && ydoc
      ? {
          collaboration: {
            provider,
            fragment: ydoc.getXmlFragment('blocknote'),
            user: {
              name: user?.username || 'Anónimo',
              color: user?.color || '#6366f1',
            },
            showCursorLabels: 'activity',
          },
        }
      : {
          initialContent: parseInitialContent(),
        },
    [provider, ydoc, user?.username, user?.color]
  );

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const jsonContent = JSON.stringify(editor.document);
      onContentChange(jsonContent);
    }, 400);
  };

  return (
    <div className="w-full min-h-[400px] text-[var(--text-primary)]">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme={theme === 'light' ? 'light' : 'dark'}
      />
    </div>
  );
};
