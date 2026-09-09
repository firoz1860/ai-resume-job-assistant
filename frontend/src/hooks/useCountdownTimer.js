import { useEffect, useRef, useState } from 'react';

export default function useCountdownTimer(initialSeconds, active, onComplete) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => setSecondsLeft(initialSeconds), [initialSeconds]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => {
      // Pure updater only — never run side effects here (React may invoke
      // updaters twice under StrictMode/concurrent, double-firing onComplete).
      setSecondsLeft((current) => (current <= 0 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  // Fire completion exactly once, from an effect, when the clock hits zero.
  useEffect(() => {
    if (active && secondsLeft === 0) onCompleteRef.current?.();
  }, [active, secondsLeft]);

  return { secondsLeft, setSecondsLeft };
}
