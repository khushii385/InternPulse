import React, { useState } from 'react';
import { API, apiPost } from '../api.js';
import { useToast } from '../components/Toast.jsx';

export default function Auth({ onLogin }) {
  const [role, setRole] = useState('STUDENT');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleLogin() {
    if (!form.email || !form.password) { setMsg({ type: 'err', text: 'Please fill in both fields.' }); return; }
    const base = role === 'STUDENT' ? API.STUDENT : API.COMPANY;
    setLoading(true);
    try {
      const data = await apiPost(`${base}/api/auth/login`, { email: form.email, password: form.password }, { auth: false });
      localStorage.setItem('ip_token', data.token);
      localStorage.setItem('ip_role', data.role);
      localStorage.setItem('ip_email', data.email);
      onLogin(data);
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
      toast(e.message, 'err');
    } finally { setLoading(false); }
  }

  async function handleRegister() {
    if (!form.email || !form.password || !form.name) { setMsg({ type: 'err', text: 'Please fill in all required fields.' }); return; }
    setLoading(true);
    const base = role === 'STUDENT' ? API.STUDENT : API.COMPANY;
    const endpoint = role === 'STUDENT' ? '/api/students' : '/api/companies';
    const body = role === 'STUDENT'
      ? { name: form.name, email: form.email, password: form.password, collegeName: form.collegeName || '' }
      : { name: form.name, email: form.email, password: form.password, website: form.website || '' };
    try {
      await apiPost(`${base}${endpoint}`, body, { auth: false });
      setMode('login');
      setMsg({ type: 'ok', text: 'Account created. Please log in.' });
      toast('Account created successfully 🎉', 'ok');
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
      toast(e.message, 'err');
    } finally { setLoading(false); }
  }

  const isLogin = mode === 'login';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div className="fade-up" style={{
        width: '100%', maxWidth: 980, display: 'grid', gridTemplateColumns: '1.05fr 1fr',
        borderRadius: 20, overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--card)',
        boxShadow: '0 40px 80px -30px #00000080',
      }} id="auth-wrap">
        <Brand />
        <div style={{ padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="fade-up" key={role + mode}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, border: '1px solid var(--line)', padding: 4, borderRadius: 10 }}>
              {['STUDENT', 'COMPANY'].map((r) => (
                <button key={r} onClick={() => setRole(r)} className="press-btn" style={tabStyle(role === r)}>
                  {r === 'STUDENT' ? 'Student' : 'Company'}
                </button>
              ))}
            </div>

            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 23, fontWeight: 600 }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6, marginBottom: 24 }}>
              {isLogin ? `Log in as ${role === 'STUDENT' ? 'a student' : 'an employer'}` : (role === 'STUDENT' ? 'Start applying to internships' : 'Start posting internships')}
            </div>

            {msg && (
              <div style={{
                fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: 16,
                background: msg.type === 'ok' ? '#4FAE8E1a' : '#E8714F1a',
                color: msg.type === 'ok' ? 'var(--ok)' : 'var(--err)',
              }}>{msg.text}</div>
            )}

            {!isLogin && <Field label={role === 'STUDENT' ? 'Full name' : 'Company name'} onChange={set('name')} placeholder={role === 'STUDENT' ? 'Rahul Sharma' : 'TCS'} />}
            <Field label="Email" onChange={set('email')} placeholder="you@example.com" />
            {!isLogin && role === 'STUDENT' && <Field label="College name" onChange={set('collegeName')} placeholder="ABC College" />}
            {!isLogin && role === 'COMPANY' && <Field label="Website" onChange={set('website')} placeholder="https://company.com" />}
            <Field label="Password" type="password" onChange={set('password')} placeholder={isLogin ? '••••••••' : 'Min 6 characters'} />

            <button
              className="press-btn" disabled={loading} onClick={isLogin ? handleLogin : handleRegister}
              style={{
                width: '100%', padding: 13, borderRadius: 9, border: 'none', marginTop: 8,
                background: 'linear-gradient(135deg,var(--amber),var(--coral))',
                color: 'var(--ink)', fontWeight: 600, fontSize: 14.5, opacity: loading ? .6 : 1,
              }}
            >
              {loading ? (isLogin ? 'Logging in…' : 'Creating…') : (isLogin ? 'Log in' : 'Create account')}
            </button>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--muted)' }}>
              {isLogin ? "New here? " : 'Already have an account? '}
              <a onClick={() => { setMode(isLogin ? 'register' : 'login'); setMsg(null); }} style={{ color: 'var(--amber)', cursor: 'pointer', textDecoration: 'none' }}>
                {isLogin ? 'Create an account' : 'Log in'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div style={{
      position: 'relative', padding: '52px 44px',
      background: 'linear-gradient(165deg,var(--ink-soft),var(--ink) 70%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      borderRight: '1px solid var(--line)', overflow: 'hidden',
    }}>
      <div style={{
        content: '""', position: 'absolute', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle,var(--amber) 0%,transparent 70%)', opacity: .14, top: -90, right: -90,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--amber),var(--coral))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
          fontWeight: 700, fontFamily: 'Fraunces, serif', fontSize: 15,
        }}>IP</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 19, fontWeight: 600 }}>InternPulse</div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 38, lineHeight: 1.18, fontWeight: 600, marginTop: 44 }}>
          Where <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>students</em><br />meet their<br />first break.
        </div>
        <div style={{ color: 'var(--muted)', marginTop: 16, fontSize: 14.5, lineHeight: 1.65, maxWidth: '30ch' }}>
          Browse internships, track applications, and get hired — all in one place.
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 36 }}>
          {[['6', 'Connected services'], ['JWT', 'Secured access'], ['Live', 'Status tracking']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: 'var(--amber)', fontWeight: 600 }}>{n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type} placeholder={placeholder} onChange={onChange}
        style={{
          width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)',
          padding: '12px 14px', borderRadius: 9, fontSize: 14, outline: 'none',
        }}
      />
    </div>
  );
}

function tabStyle(active) {
  return {
    flex: 1, textAlign: 'center', padding: 9, borderRadius: 7, fontSize: 13, border: 'none',
    background: active ? 'var(--amber-soft)' : 'transparent',
    color: active ? 'var(--amber)' : 'var(--muted)', fontWeight: active ? 600 : 400,
  };
}
