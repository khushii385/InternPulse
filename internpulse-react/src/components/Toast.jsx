import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { text, type }
  const timerRef = useRef(null);

  const showToast = useCallback((text, type = '') => {
    setToast({ text, type });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: 24, left: '50%',
          transform: `translateX(-50%) translateY(${toast ? 0 : 20}px)`,
          background: 'var(--card)',
          border: `1px solid ${toast?.type === 'err' ? 'var(--err)' : toast?.type === 'ok' ? 'var(--ok)' : 'var(--line)'}`,
          color: toast?.type === 'err' ? 'var(--err)' : toast?.type === 'ok' ? 'var(--ok)' : 'var(--text)',
          padding: '13px 20px', borderRadius: 11, fontSize: 13.5, zIndex: 999,
          opacity: toast ? 1 : 0, pointerEvents: toast ? 'auto' : 'none',
          boxShadow: '0 20px 40px -15px #000000a0', transition: 'all .25s ease',
        }}
      >
        {toast?.text}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
