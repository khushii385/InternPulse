import React, { useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { API, apiUpload, notify } from '../api.js';
import { useToast } from './Toast.jsx';
import { validateResume, formatSize } from '../resume.js';

const NOTE_LIMIT = 1000;

export default function ApplyModal({ job, companyName, onClose, onApplied }) {
  const me = window.__meStudent || {};
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  if (!job) return null;

  async function choose(f) {
    if (!f) return;
    const err = await validateResume(f);
    if (err) { setFile(null); setFileError(err); return; }
    setFileError('');
    setMsg(null);
    setFile(f);
  }

  function preview() {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function submit() {
    const studentId = localStorage.getItem('ip_studentId');
    if (!studentId) {
      setMsg({ type: 'err', text: 'Could not identify your account. Try logging out and back in.' });
      return;
    }
    const err = await validateResume(file);
    if (err) { setFileError(err); return; }

    setLoading(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append('studentId', String(studentId));
      form.append('internshipId', String(job.id));
      if (note.trim()) form.append('coverNote', note.trim());
      form.append('resume', file, file.name);
      await apiUpload(`${API.INTERNSHIP}/api/applications`, form);

      setMsg({ type: 'ok', text: 'Application submitted!' });
      toast('Application submitted successfully 🎉', 'ok');
      await notify(
        localStorage.getItem('ip_email'),
        'Application received',
        `Your application for "${job.title}" at ${companyName} has been received.`,
        'APPLICATION_RECEIVED'
      );
      onApplied();
      setTimeout(onClose, 700);
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
      toast(e.message, 'err');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: 12.5, color: 'var(--amber)', marginBottom: 4 }}>{companyName}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600 }}>{job.title}</div>
      <div style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6, marginBottom: 18 }}>
        Attach your resume to apply
      </div>

      {/* who is applying - comes from the account, not typed again */}
      <div style={{ background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 9, padding: '11px 14px', marginBottom: 18 }}>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 3 }}>Applying as</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{me.name || localStorage.getItem('ip_email')}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
          {localStorage.getItem('ip_email')}{me.collegeName ? ` · ${me.collegeName}` : ''}
        </div>
      </div>

      <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
        Resume <span style={{ color: 'var(--amber)' }}>(PDF only, max 2 MB)</span> *
      </label>

      {!file ? (
        <div
          data-dropzone
          onClick={() => inputRef.current && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files[0]); }}
          style={{
            border: `1.5px dashed ${fileError ? 'var(--err)' : dragging ? 'var(--amber)' : 'var(--line)'}`,
            background: dragging ? 'var(--amber-soft)' : 'var(--ink)',
            borderRadius: 11, padding: '22px 14px', textAlign: 'center', cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 24 }}>📄</div>
          <div style={{ fontSize: 13.5, marginTop: 6 }}>Click to choose a PDF, or drag it here</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Only .pdf files up to 2 MB</div>
        </div>
      ) : (
        <div data-picked style={{
          display: 'flex', alignItems: 'center', gap: 12, background: 'var(--ink)',
          border: '1px solid var(--ok)', borderRadius: 11, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 24 }}>📄</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ok)', marginTop: 2 }}>Valid PDF · {formatSize(file.size)}</div>
          </div>
          <button onClick={preview} style={linkBtn}>Preview</button>
          <button onClick={() => { setFile(null); setFileError(''); }} style={{ ...linkBtn, color: 'var(--err)' }}>Remove</button>
        </div>
      )}
      <input
        ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; choose(f); }}
      />
      {fileError && <div data-fileerror style={{ fontSize: 12.5, color: 'var(--err)', marginTop: 8 }}>{fileError}</div>}

      <div style={{ margin: '18px 0 16px' }}>
        <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
          Why are you a good fit? (optional)
        </label>
        <textarea
          value={note} maxLength={NOTE_LIMIT} onChange={(e) => setNote(e.target.value)}
          placeholder="A couple of lines about yourself..."
          style={{
            width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)',
            padding: '12px 14px', borderRadius: 9, fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>{note.length}/{NOTE_LIMIT}</div>
      </div>

      {msg && (
        <div style={{
          fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: 16,
          background: msg.type === 'ok' ? '#4FAE8E1a' : '#E8714F1a',
          color: msg.type === 'ok' ? 'var(--ok)' : 'var(--err)',
        }}>{msg.text}</div>
      )}

      <button className="press-btn" disabled={loading} onClick={submit} style={{
        width: '100%', padding: 13, borderRadius: 9, border: 'none',
        background: 'linear-gradient(135deg,var(--amber),var(--coral))', color: 'var(--ink)',
        fontWeight: 600, fontSize: 14.5, opacity: loading ? .6 : 1,
      }}>{loading ? 'Uploading…' : 'Submit application'}</button>
    </Modal>
  );
}

const linkBtn = { background: 'transparent', border: 'none', color: 'var(--amber)', fontSize: 12.5, padding: 4 };
