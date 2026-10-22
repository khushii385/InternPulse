import React, { useRef, useState } from 'react';

export default function Topbar({ session, onLogout, notifications = [], tabs, active, onTabChange, showBell = true }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  React.useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 22, padding: '14px 18px',
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,var(--amber),var(--coral))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
          fontWeight: 700, fontFamily: 'Fraunces, serif', fontSize: 13,
        }}>IP</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600 }}>InternPulse</div>
      </div>

      <div style={{ display: 'flex', gap: 6, background: 'var(--ink)', padding: 4, borderRadius: 10, border: '1px solid var(--line)' }}>
        {tabs.map(([key, label]) => (
          <button
            key={key} onClick={() => onTabChange(key)} className="press-btn"
            style={{
              padding: '8px 16px', borderRadius: 7, fontSize: 13, border: 'none',
              background: active === key ? 'var(--amber-soft)' : 'transparent',
              color: active === key ? 'var(--amber)' : 'var(--muted)',
              fontWeight: active === key ? 600 : 400,
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} ref={wrapRef}>
        {showBell && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
              style={{
                background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)',
                width: 36, height: 36, borderRadius: 8, fontSize: 15, position: 'relative',
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: 'var(--coral)' }} />
              )}
            </button>
            {open && (
              <div className="scale-in" style={{
                position: 'absolute', top: 44, right: 0, width: 300, maxHeight: 360, overflow: 'auto',
                background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 10,
                boxShadow: '0 20px 50px -20px #000000c0', zIndex: 30,
              }}>
                {notifications.length === 0 && (
                  <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No notifications yet.</div>
                )}
                {notifications.slice().reverse().map((n) => (
                  <div key={n.id} style={{ padding: '10px 10px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{n.subject}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 5 }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{session.email} · {session.role}</span>
        <button
          onClick={onLogout}
          style={{
            background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)',
            padding: '8px 14px', borderRadius: 8, fontSize: 13,
          }}
        >Log out</button>
      </div>
    </div>
  );
}
