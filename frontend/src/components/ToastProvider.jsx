import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext({ notify: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const notify = useCallback((message, type = 'success') => {
    // Monotonic id — Date.now() collides for toasts fired in the same ms.
    idRef.current += 1;
    const id = idRef.current;
    setToasts((current) => [...current, { id, message, type }].slice(-4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  useEffect(() => {
    const authExpired = () => notify('Login expired. Please sign in again.', 'error');
    window.addEventListener('careeros:auth-expired', authExpired);
    return () => window.removeEventListener('careeros:auth-expired', authExpired);
  }, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-[90] space-y-2 w-[min(22rem,calc(100vw-2rem))]" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 shadow-card bg-white text-sm font-semibold ${
              toast.type === 'error' ? 'border-red-200 text-red-700' : 'border-emerald-200 text-emerald-700'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
