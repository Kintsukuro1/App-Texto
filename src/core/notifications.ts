/**
 * Servicio centralizado de notificaciones del sistema (Windows / Browser Native Notifications)
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendSystemNotification = (title: string, body: string, icon: string = '✨'): void => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${icon} ${title}`, {
        body,
        icon: '/favicon.ico',
        tag: 'notion-local-alert',
      });
    }
  } catch (err) {
    console.error('Error al emitir notificación del sistema:', err);
  }
};
