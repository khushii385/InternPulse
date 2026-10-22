import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { API, apiPatch, notify } from '../api.js';
import { useToast } from './Toast.jsx';

export default function CompleteModal({ interview, student, jobTitle, onClose, onDone }) {
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const toast = useToast();

  async function submit() {
    setLoading(true);
    setErr('');
    try {
      await apiPatch(`${API.INTERVIEW}/api/interviews/${interview.id}/complete`, { rating, feedback }, { auth: true });
      toast('Interview marked as done ✅', 'ok');
      await notify(
        student?.email,
        'Interview completed',
        `Your interview for "${jobTitle}" is complete. The company will share the final decision soon.`,
        'GENERAL'
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
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600 }}>Interview feedback</div>
      <div style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6, marginBottom: 20 }}>
        {student ? student.name : 'Candidate'} — rate the interview and leave a note
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Rating</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} style={{
              background: 'transparent', border: 'none', fontSize: 30, lineHeight: 1, padding: 2,
              color: n <= rating ? 'var(--amber)' : 'var(--line)',
              transform: n <= rating ? 'scale(1.08)' : 'scale(1)',
            }}>★</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Feedback (optional)</label>
        <textarea
          value={feedback} onChange={(e) => setFeedback(e.target.value)}
          placeholder="Strong problem solving, good communication…"
          style={{
            width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)',
            padding: '12px 14px', borderRadius: 9, fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical',
          }}
        />
      </div>

      {err && (
        <div style={{ fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: 16, background: '#E8714F1a', color: 'var(--err)' }}>{err}</div>
      )}

      <button className="press-btn" disabled={loading} onClick={submit} style={{
        width: '100%', padding: 13, borderRadius: 9, border: 'none',
        background: 'linear-gradient(135deg,var(--amber),var(--coral))', color: 'var(--ink)',
        fontWeight: 600, fontSize: 14.5, opacity: loading ? .6 : 1,
      }}>{loading ? 'Saving…' : 'Mark interview as done'}</button>
    </Modal>
  );
}
