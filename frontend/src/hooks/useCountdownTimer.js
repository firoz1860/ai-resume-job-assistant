import { useEffect, useRef, useState } from 'react';

export default function useCountdownTimer(initialSeconds, active, onComplete) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => setSecondsLeft(initialSeconds), [initialSeconds]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(id);
          onCompleteRef.current?.();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return { secondsLeft, setSecondsLeft };
}
