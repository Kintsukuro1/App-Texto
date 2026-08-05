import { useState, useCallback, useRef, useEffect } from 'react';

export type MascotMood = 'idle' | 'happy';

export const useMascotState = () => {
  const [mood, setMood] = useState<MascotMood>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerHappyReaction = useCallback(() => {
    setMood('happy');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setMood('idle');
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    mood,
    triggerHappyReaction,
  };
};
