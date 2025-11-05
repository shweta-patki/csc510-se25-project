import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ToastContext } from './toastHelpers';

let idSeq = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // { id, message, type, duration }

  const remove = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = idSeq++;
    setToasts((ts) => [...ts, { id, message, type, duration }]);
    return id;
  }, []);

  // auto-dismiss
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), t.duration));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts, remove]);

  const value = useMemo(() => ({ showToast: show, removeToast: remove }), [show, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}
               onClick={() => remove(t.id)}
               role="status" aria-live="polite">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

