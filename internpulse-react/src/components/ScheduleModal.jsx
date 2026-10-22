import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { API, apiPost, notify } from '../api.js';
import { useToast } from './Toast.jsx';

const inputStyle = {
  width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)',
  padding: '12px 14px', borderRadius: 9, fontSize: 14, outline: 'none',
};
const labelStyle = { fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 };

export default function ScheduleModal({ applicant, student, jobTitle, onClose, onDone }) {
  const [when, setWhen] = useState('');
  const [mode, setMode] = useState('ONLINE');
  const [link, setLink] = useState('');
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const toast = useToast();

  async function submit() {
    if (!when) { setErr('Please pick a date and time.'); return; }
    setLoading(true);
    setErr('');
    try {
      await apiPost(`${API.INTERVIEW}/api/interviews`, {
        applicationId: applicant.id,
        scheduledAt: when.length === 16 ? when + ':00' : when,
        mode,
        meetingLink: mode === 'ONLINE' ? link : null,
        location: mode === 'OFFLINE' ? place : null,
      }, { auth: true });

      toast('Interview scheduled 📅', 'ok');
      await notify(
        student?.email,
        'Interview scheduled',
        `Your interview for "${jobTitle}" is on ${new Date(when).toLocaleString()} (${mode.toLowerCase()}).`,
        'INTERVIEW_SCHEDULED'
      );
      if (onDone) await onDone();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally { setLoading(false); }
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: 12.5, color: 'var(--amber)', marginBottom: 4 }}>{jobTitle}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600 }}>
        Schedule interview
      </div>
      <div style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6, marginBottom: 20 }}>
        With {student ? student.name : `Student #${applicant.studentId}`}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Date & time</label>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Mode</label>
        <div style={{ display: 'flex', gap: 8, border: '1px solid var(--line)', padding: 4, borderRadius: 10 }}>
          {['ONLINE', 'OFFLINE'].map((m) => (
            <button key={m} onClick={() => setMode(m)} className="press-btn" style={{
              flex: 1, padding: 9, borderRadius: 7, fontSize: 13, border: 'none',
              background: mode === m ? 'var(--amber-soft)' : 'transparent',
              color: mode === m ? 'var(--amber)' : 'var(--muted)', fontWeight: mode === m ? 600 : 400,
            }}>{m === 'ONLINE' ? 'Online' : 'In person'}</button>
          ))}
        </div>
      </div>

      {mode === 'ONLINE' ? (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Meeting link</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/..." style={inputStyle} />
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Location</label>
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Office address / room" style={inputStyle} />
        </div>
      )}

      {err && (
        <div style={{ fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: 16, background: '#E8714F1a', color: 'var(--err)' }}>{err}</div>
      )}

      <button className="press-btn" disabled={loading} onClick={submit} style={{
        width: '100%', padding: 13, borderRadius: 9, border: 'none',
        background: 'linear-gradient(135deg,var(--amber),var(--coral))', color: 'var(--ink)',
        fontWeight: 600, fontSize: 14.5, opacity: loading ? .6 : 1,
      }}>{loading ? 'Scheduling…' : 'Schedule interview'}</button>
    </Modal>
  );
}
