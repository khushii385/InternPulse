import React, { useEffect, useMemo, useState } from 'react';

const WORDS = ['Where', 'students', 'meet', 'their', 'first', 'break.'];
const DOMAINS = ['Backend', 'Frontend', 'AI / ML', 'Cloud', 'Design', 'Data Science', 'DevOps'];
const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Infosys', 'TCS', 'Adobe', 'Flipkart', 'Zoho', 'Wipro', 'Swiggy', 'Zomato', 'Accenture', 'Cognizant'];
const CHIP_TEXT = ['Backend Intern', 'React Developer', 'Data Analyst', 'Cloud Intern', 'UI/UX Design', 'DevOps', 'AI / ML', 'QA Testing', 'Full Stack', 'Product Intern'];
const FLOAT_CARDS = [
  { cls: 'fc-1', title: 'Backend Intern', co: 'Google', pay: '₹50k/mo' },
  { cls: 'fc-2', title: 'UI/UX Design Intern', co: 'Adobe', pay: '₹35k/mo' },
  { cls: 'fc-3', title: 'Cloud Intern', co: 'Amazon', pay: '₹45k/mo' },
];

function useTypewriter(words, active) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active) return;
    let i = 0, pos = 0, deleting = false, timer;
    const tick = () => {
      const word = words[i % words.length];
      if (!deleting) {
        pos++;
        setText(word.slice(0, pos));
        if (pos === word.length) { deleting = true; timer = setTimeout(tick, 1500); return; }
      } else {
        pos--;
        setText(word.slice(0, pos));
        if (pos === 0) { deleting = false; i++; }
      }
      timer = setTimeout(tick, deleting ? 40 : 90);
    };
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [active]);
  return text;
}

export default function Landing({ onEnter }) {
  const [shown, setShown] = useState(0);
  const [ready, setReady] = useState(false);
  const typed = useTypewriter(DOMAINS, ready);

  useEffect(() => {
    const timers = WORDS.map((_, i) => setTimeout(() => setShown(i + 1), 230 * i + 350));
    const doneTimer = setTimeout(() => setReady(true), 230 * WORDS.length + 550);
    return () => { timers.forEach(clearTimeout); clearTimeout(doneTimer); };
  }, []);

  // Chips that slowly rise through the background
  const chips = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({
    text: CHIP_TEXT[i % CHIP_TEXT.length],
    left: 3 + Math.random() * 90,
    duration: 16 + Math.random() * 14,
    delay: -Math.random() * 28,
  })), []);

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px');
    e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px');
  }

  const reveal = (delay) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
  });

  return (
    <div className="lp-root" onMouseMove={onMove}>
      {/* ---------- background layers ---------- */}
      <div className="lp-blob b1" />
      <div className="lp-blob b2" />
      <div className="lp-blob b3" />
      <div className="lp-grid" />
      <div className="lp-spot" />
      <div className="lp-bigtext">INTERNPULSE</div>
      {chips.map((c, i) => (
        <div key={i} className="lp-chip" style={{ left: c.left + '%', animationDuration: c.duration + 's', animationDelay: c.delay + 's' }}>
          {c.text}
        </div>
      ))}
      {FLOAT_CARDS.map((c) => (
        <div key={c.cls} className={`lp-fcard ${c.cls}`} style={{ opacity: ready ? 1 : 0, transition: 'opacity .8s ease .3s' }}>
          <div style={{ fontSize: 10.5, color: 'var(--amber)', fontWeight: 600 }}>{c.co.toUpperCase()}</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, marginTop: 4 }}>{c.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Open now</span>
            <span style={{ fontSize: 11.5, color: 'var(--amber)', background: 'var(--amber-soft)', padding: '3px 9px', borderRadius: 999 }}>{c.pay}</span>
          </div>
        </div>
      ))}

      {/* ---------- content ---------- */}
      <div className="lp-content">
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 46 }}>
          <div className="lp-logo-wrap">
            <span className="lp-ring" /><span className="lp-ring" /><span className="lp-ring" />
            <div style={{
              position: 'relative', width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg,var(--amber),var(--coral))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
              fontWeight: 700, fontFamily: 'Fraunces, serif', fontSize: 18,
            }}>IP</div>
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600 }}>InternPulse</div>
        </div>

        <h1 style={{
          fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 'clamp(38px, 7vw, 68px)',
          lineHeight: 1.15, maxWidth: 800,
        }}>
          {WORDS.map((w, i) => (
            <span
              key={i}
              className={w === 'students' ? 'lp-grad' : ''}
              style={{
                display: 'inline-block', marginRight: '0.28em',
                opacity: shown > i ? 1 : 0,
                transform: shown > i ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.96)',
                filter: shown > i ? 'blur(0)' : 'blur(6px)',
                transition: 'opacity .6s cubic-bezier(.2,.8,.2,1), transform .6s cubic-bezier(.2,.8,.2,1), filter .6s ease',
              }}
            >{w}</span>
          ))}
        </h1>

        <div style={{ ...reveal(0.05), marginTop: 22, fontSize: 19, color: 'var(--text)', minHeight: 30 }}>
          Find your next <span className="lp-typed">{typed}</span><span className="lp-caret" /> internship
        </div>

        <p style={{ ...reveal(0.15), color: 'var(--muted)', fontSize: 15.5, marginTop: 14, maxWidth: 500, lineHeight: 1.65 }}>
          Browse internships, track applications, schedule interviews and collect certificates —
          all in one place, powered by a 6-service microservices backend.
        </p>

        <div style={{ ...reveal(0.25), display: 'flex', gap: 34, marginTop: 34 }}>
          {[['6', 'Microservices'], ['JWT', 'Secured'], ['Live', 'Tracking']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: 'var(--amber)', fontWeight: 600 }}>{n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ ...reveal(0.35), marginTop: 42, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <button onClick={onEnter} className="press-btn lp-cta" style={{
            padding: '16px 40px', borderRadius: 13, border: 'none',
            background: 'linear-gradient(135deg,var(--amber),var(--coral))', color: 'var(--ink)',
            fontWeight: 600, fontSize: 15.5, cursor: 'pointer',
          }}>
            Get started →
          </button>
          <a onClick={onEnter} style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer', textDecoration: 'none' }}>
            Already have an account? <span style={{ color: 'var(--amber)' }}>Log in</span>
          </a>
        </div>
      </div>

      {/* ---------- company marquee ---------- */}
      <div className="lp-marquee">
        <div className="lp-marquee-track">
          {[0, 1].map((k) => (
            <div key={k} className="lp-marquee-half">
              {COMPANIES.map((c) => <span key={c + k}>{c} <em>◆</em></span>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
