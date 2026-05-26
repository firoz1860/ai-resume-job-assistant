import { useEffect, useState } from 'react';

export default function useCountdownTimer(initialSeconds, active, onComplete) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => setSecondsLeft(initialSeconds), [initialSeconds]);

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(id);
          onComplete?.();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, onComplete]);

  return { secondsLeft, setSecondsLeft };
}
