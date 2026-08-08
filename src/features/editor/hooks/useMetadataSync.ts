import { useEffect, useCallback, useRef } from 'react';
import type { HocuspocusProvider } from '@hocuspocus/provider';
import type { Page } from '@/types/page';
import { useNotesStore } from '@/stores/useNotesStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/**
 * Hook que sincroniza metadatos de la página (título, ícono, portada, tags, etc.)
 * entre usuarios conectados al mismo documento vía Hocuspocus awareness.
 *
 * Funciona así:
 * - Cuando el usuario local cambia metadatos, se emite un campo `pageMetadata`
 *   en el awareness local con los datos actualizados + timestamp.
 * - Cuando otro usuario emite `pageMetadata`, lo recibimos vía awareness change
 *   y aplicamos los cambios al store si el timestamp es más reciente.
 */

interface MetadataPayload {
  title: string;
  icon: string | null;
  coverImage: string | null;
  tags: string[];
  isFavorite: boolean;
  isPrivate: boolean;
  updatedAt: string;
  /** ID del usuario que emitió el cambio */
  sourceUserId: string;
}

export function useMetadataSync(
  provider: HocuspocusProvider | null,
  page: Page
) {
  const { user } = useAuthStore();
  const lastAppliedTimestamp = useRef<string>('');
  const pageIdRef = useRef(page.id);

  // Mantener ref del pageId actualizado
  useEffect(() => {
    pageIdRef.current = page.id;
  }, [page.id]);

  // Emitir metadatos locales al awareness cuando cambian
  const broadcastMetadata = useCallback(
    (updatedPage: Partial<Page>) => {
      if (!provider?.awareness || !user) return;

      const payload: MetadataPayload = {
        title: updatedPage.title ?? page.title,
        icon: updatedPage.icon ?? page.icon ?? null,
        coverImage: updatedPage.coverImage ?? page.coverImage ?? null,
        tags: updatedPage.tags ?? page.tags ?? [],
        isFavorite: updatedPage.isFavorite ?? page.isFavorite,
        isPrivate: updatedPage.isPrivate ?? page.isPrivate ?? false,
        updatedAt: new Date().toISOString(),
        sourceUserId: user.id,
      };

      provider.awareness.setLocalStateField('pageMetadata', payload);
    },
    [provider, user, page.title, page.icon, page.coverImage, page.tags, page.isFavorite, page.isPrivate]
  );

  // Escuchar cambios de awareness de otros usuarios
  useEffect(() => {
    if (!provider?.awareness || !user) return;

    const handleAwarenessChange = () => {
      const awareness = provider.awareness;
      if (!awareness) return;

      const states = awareness.getStates();
      const localClientId = awareness.clientID;

      states.forEach((state, clientId) => {
        if (clientId === localClientId) return; // Ignorar cambios propios

        const meta = state.pageMetadata as MetadataPayload | undefined;
        if (!meta || !meta.updatedAt) return;

        // Solo aplicar si es más reciente que el último que aplicamos
        if (meta.updatedAt <= lastAppliedTimestamp.current) return;

        // Solo aplicar si viene de otro usuario
        if (meta.sourceUserId === user.id) return;

        lastAppliedTimestamp.current = meta.updatedAt;

        // Aplicar cambios al store local (sin hacer API call - ya lo hizo el otro usuario)
        const currentPages = useNotesStore.getState().pages;
        const currentPage = currentPages[pageIdRef.current];
        if (!currentPage) return;

        const updated = {
          ...currentPage,
          title: meta.title,
          icon: meta.icon,
          coverImage: meta.coverImage,
          tags: meta.tags,
          isFavorite: meta.isFavorite,
          isPrivate: meta.isPrivate,
          updatedAt: meta.updatedAt,
        };

        // Actualizar el store directamente (sin llamar al API)
        useNotesStore.setState((state) => ({
          pages: { ...state.pages, [pageIdRef.current]: updated },
        }));
      });
    };

    provider.awareness.on('change', handleAwarenessChange);
    provider.awareness.on('update', handleAwarenessChange);

    return () => {
      if (provider.awareness) {
        provider.awareness.off('change', handleAwarenessChange);
        provider.awareness.off('update', handleAwarenessChange);
      }
    };
  }, [provider, user]);

  return { broadcastMetadata };
}
