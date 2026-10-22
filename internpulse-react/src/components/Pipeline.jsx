import React from 'react';
import { STEPS } from '../flow.js';

export default function Pipeline({ stage, rejected }) {
  const last = STEPS.length - 1;
  const fill = rejected ? 0 : (Math.max(stage, 0) / last) * 100;

  return (
    <div style={{ margin: '18px 0 8px' }}>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
        {/* track + animated fill */}
        <div style={{
          position: 'absolute', top: 8, height: 2, background: 'var(--line)',
          left: `${50 / STEPS.length}%`, right: `${50 / STEPS.length}%`,
        }}>
          <div style={{
            height: '100%', width: `${fill}%`,
            background: 'linear-gradient(90deg,var(--amber),var(--coral))',
            transition: 'width .7s cubic-bezier(.2,.8,.2,1)',
          }} />
        </div>

        {STEPS.map((label, i) => {
          const done = !rejected && (i < stage || (stage === last && i === last));
          const current = !rejected && i === stage && stage < last;
          const lit = done || current;
          return (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, position: 'relative' }}>
              <div
                className={current ? 'pipe-current' : ''}
                style={{
                  width: 18, height: 18, borderRadius: '50%', boxSizing: 'border-box',
                  background: done ? 'var(--amber)' : 'var(--card)',
                  border: `2px solid ${lit ? 'var(--amber)' : 'var(--line)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'var(--ink)',
                  transition: 'background .4s ease, border-color .4s ease',
                }}
              >{done ? '✓' : ''}</div>
              <div style={{
                fontSize: 10.5, textAlign: 'center', lineHeight: 1.2,
                color: lit ? 'var(--text)' : 'var(--muted)', fontWeight: current ? 600 : 400,
              }}>{label}</div>
            </div>
          );
        })}
      </div>

      {rejected && (
        <div style={{
          marginTop: 12, display: 'inline-block', fontSize: 11.5, padding: '4px 11px',
          borderRadius: 999, background: '#E8714F22', color: 'var(--err)', fontWeight: 600,
        }}>Rejected</div>
      )}
    </div>
  );
}
