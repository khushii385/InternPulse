import React from 'react';

export default function Modal({ onClose, children }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: '#0000009a', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div className="scale-in" style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
        padding: 28, maxWidth: 440, width: '100%', maxHeight: '90vh', overflow: 'auto',
      }}>
        <button onClick={onClose} style={{ float: 'right', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 18 }}>✕</button>
        {children}
      </div>
    </div>
  );
}
