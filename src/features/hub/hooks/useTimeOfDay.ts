import { useMemo } from 'react';

export interface TimeOfDayInfo {
  message: string;
  gradient: string;
  icon: string;
  subtitle: string;
}

export const useTimeOfDay = (): TimeOfDayInfo => {
  return useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 6) {
      return {
        message: 'Buenas madrugadas',
        gradient: 'from-indigo-400 via-purple-400 to-indigo-600',
        icon: '🌙',
        subtitle: 'Momento de calma y enfoque profundo.',
      };
    } else if (hour >= 6 && hour < 12) {
      return {
        message: 'Buenos días',
        gradient: 'from-amber-300 via-orange-400 to-amber-500',
        icon: '☀️',
        subtitle: 'Comienza un nuevo día lleno de ideas.',
      };
    } else if (hour >= 12 && hour < 20) {
      return {
        message: 'Buenas tardes',
        gradient: 'from-indigo-300 via-purple-400 to-violet-500',
        icon: '🌤️',
        subtitle: 'Mantén el ritmo y haz avanzar tus notas.',
      };
    } else {
      return {
        message: 'Buenas noches',
        gradient: 'from-purple-400 via-indigo-400 to-slate-300',
        icon: '✨',
        subtitle: 'Un buen momento para repasar y organizar tus notas.',
      };
    }
  }, []);
};
