import { useState, useEffect } from 'react';
import type { HocuspocusProvider } from '@hocuspocus/provider';

export interface PresenceUser {
  id: string;
  username: string;
  color: string;
}

export const usePresence = (provider: HocuspocusProvider | null): PresenceUser[] => {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!provider || !provider.awareness) {
      setUsers([]);
      return;
    }

    const updatePresence = () => {
      const awareness = provider.awareness;
      if (!awareness) return;

      const states = awareness.getStates();
      const localClientId = awareness.clientID;

      const activeUsers: PresenceUser[] = [];
      const seenUserIds = new Set<string>();

      states.forEach((state, clientId) => {
        if (clientId === localClientId) return; // Omitir usuario local

        // State can contain user metadata from Hocuspocus / BlockNote collaboration
        const user = state.user as PresenceUser | undefined;
        if (user && user.id && !seenUserIds.has(user.id)) {
          seenUserIds.add(user.id);
          activeUsers.push({
            id: user.id,
            username: user.username || (state.user as any)?.name || 'Anónimo',
            color: user.color || '#6366f1',
          });
        }
      });

      setUsers(activeUsers);
    };

    // Escuchar cambios en awareness
    provider.awareness.on('change', updatePresence);
    provider.awareness.on('update', updatePresence);

    // Ejecutar evaluación inicial
    updatePresence();

    return () => {
      if (provider.awareness) {
        provider.awareness.off('change', updatePresence);
        provider.awareness.off('update', updatePresence);
      }
    };
  }, [provider]);

  return users;
};
