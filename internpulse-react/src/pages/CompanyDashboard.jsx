import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { API, apiGet, apiPost, apiPatch, notify, openPdf } from '../api.js';
import Topbar from '../components/Topbar.jsx';
import { EmptyState, cardBase } from './StudentDashboard.jsx';
import { useToast } from '../components/Toast.jsx';
import ScheduleModal from '../components/ScheduleModal.jsx';
import CompleteModal from '../components/CompleteModal.jsx';
import Pipeline from '../components/Pipeline.jsx';
import { getStage, activeInterview, COMPANY_HINT, STEPS } from '../flow.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function CompanyDashboard({ session, onLogout }) {
  const [subTab, setSubTab] = useState('postings');
  const [postings, setPostings] = useState(null);
  const [applicantsFor, setApplicantsFor] = useState(null); // the posting being reviewed
  const [applicants, setApplicants] = useState(null);
  const [students, setStudents] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [certs, setCerts] = useState([]);
  const [scheduleFor, setScheduleFor] = useState(null); // application to schedule
  const [completeFor, setCompleteFor] = useState(null); // { app, interview }
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();
  const applicantsRef = useRef(null);

  useEffect(() => { init(); }, []);

  // When a posting is opened, bring its applicants into view
  useEffect(() => {
    if (applicantsFor && applicantsRef.current && applicantsRef.current.scrollIntoView) {
      applicantsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [applicantsFor?.id]);

  function closeApplicants() {
    setApplicantsFor(null);
    setApplicants(null);
  }

  async function init() {
    try {
      const companies = await apiGet(`${API.COMPANY}/api/companies`, { auth: false });
      const me = companies.find((c) => c.email === session.email);
      if (me) {
        localStorage.setItem('ip_companyId', me.id);
        localStorage.setItem('ip_companyName', me.name);
      }
    } catch (e) { /* ignore */ }
    loadPostings();
  }

  async function loadPostings() {
    const companyId = localStorage.getItem('ip_companyId');
    if (!companyId) { setPostings([]); return; }
    try {
      const data = await apiGet(`${API.INTERNSHIP}/api/internships/company/${companyId}`, { auth: true });
      setPostings(data);
    } catch (e) { setPostings([]); }
  }

  // Interviews (interview-service) and certificates (certificate-service) decide each applicant's stage
  async function loadPipeline(apps) {
    const studentIds = [...new Set(apps.map((a) => a.studentId))];
    const [ivLists, certLists] = await Promise.all([
      Promise.all(apps.map((a) =>
        apiGet(`${API.INTERVIEW}/api/interviews/application/${a.id}`, { auth: true }).catch(() => [])
      )),
      Promise.all(studentIds.map((id) =>
        apiGet(`${API.CERTIFICATE}/api/certificates/student/${id}`, { auth: true }).catch(() => [])
      )),
    ]);
    setInterviews(ivLists.flat());
    setCerts(certLists.flat());
  }

  async function viewApplicants(job) {
    setApplicantsFor(job);
    setApplicants(null);
    setInterviews([]);
    setCerts([]);
    try {
      const [apps, list] = await Promise.all([
        apiGet(`${API.INTERNSHIP}/api/applications/internship/${job.id}`, { auth: true }),
        apiGet(`${API.STUDENT}/api/students`, { auth: false }).catch(() => []),
      ]);
      setStudents(Object.fromEntries(list.map((s) => [s.id, s])));
      setApplicants(apps);
      await loadPipeline(apps);
    } catch (e) { setApplicants([]); }
  }

  async function refresh() {
    if (!applicantsFor) return;
    try {
      const apps = await apiGet(`${API.INTERNSHIP}/api/applications/internship/${applicantsFor.id}`, { auth: true });
      setApplicants(apps);
      await loadPipeline(apps);
    } catch (e) { /* ignore */ }
  }

  // Runs one pipeline action: disables that card's buttons, shows errors, then refreshes the stage
  async function run(app, fn) {
    setBusyId(app.id);
    try { await fn(); await refresh(); }
    catch (e) { toast(e.message, 'err'); }
    finally { setBusyId(null); }
  }

  const title = applicantsFor?.title;

  // How many applicants are in each stage (shown as chips above the list)
  const summary = useMemo(() => {
    const counts = Object.fromEntries([...STEPS, 'Rejected'].map((k) => [k, 0]));
    (applicants || []).forEach((a) => {
      const st = getStage(a, interviews, certs);
      counts[st === -1 ? 'Rejected' : STEPS[st]]++;
    });
    return Object.entries(counts);
  }, [applicants, interviews, certs]);

  const setStatus = (app, status) => run(app, async () => {
    await apiPatch(`${API.INTERNSHIP}/api/applications/${app.id}/status`, { status }, { auth: true });
    const email = students[app.studentId]?.email;
    if (status === 'SHORTLISTED') {
      notify(email, 'You are shortlisted', `Good news! You're shortlisted for "${title}". An interview will be scheduled soon.`, 'STATUS_UPDATED');
      toast('Candidate shortlisted', 'ok');
    } else if (status === 'SELECTED') {
      notify(email, 'You are selected 🎉', `Congratulations! You've been selected for "${title}".`, 'OFFER_LETTER');
      toast('Candidate selected 🎉', 'ok');
    } else if (status === 'REJECTED') {
      notify(email, 'Application update', `Thank you for applying to "${title}". Unfortunately you were not selected this time.`, 'STATUS_UPDATED');
      toast('Candidate rejected', 'ok');
    }
  });

  const cancelInterview = (app, iv) => run(app, async () => {
    await apiPatch(`${API.INTERVIEW}/api/interviews/${iv.id}/cancel`, {}, { auth: true });
    notify(students[app.studentId]?.email, 'Interview cancelled', `Your interview for "${title}" was cancelled. A new time will be shared.`, 'GENERAL');
    toast('Interview cancelled', 'ok');
  });

  const issueCertificate = (app) => run(app, async () => {
    const s = students[app.studentId];
    await apiPost(`${API.CERTIFICATE}/api/certificates`, {
      studentId: app.studentId,
      internshipId: app.internshipId,
      studentName: s?.name || `Student #${app.studentId}`,
      companyName: localStorage.getItem('ip_companyName') || session.email,
      internshipTitle: title,
      durationInMonths: applicantsFor.durationInMonths || 1,
    }, { auth: true });
    notify(s?.email, 'Certificate issued', `Your certificate for "${title}" is ready — check the Certificates tab.`, 'GENERAL');
    toast('Certificate issued 🎓', 'ok');
  });

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      <Topbar
        session={session} onLogout={onLogout} showBell={false}
        tabs={[['dashboard', 'Dashboard']]} active="dashboard" onTabChange={() => {}}
      />

      <div style={{ display: 'flex', gap: 6, background: 'var(--ink)', padding: 4, borderRadius: 10, border: '1px solid var(--line)', width: 'fit-content', marginBottom: 24 }}>
        {[['postings', 'Postings'], ['analytics', 'Analytics']].map(([k, l]) => (
          <button key={k} onClick={() => setSubTab(k)} className="press-btn" style={{
            padding: '8px 16px', borderRadius: 7, fontSize: 13, border: 'none',
            background: subTab === k ? 'var(--amber-soft)' : 'transparent',
            color: subTab === k ? 'var(--amber)' : 'var(--muted)', fontWeight: subTab === k ? 600 : 400,
          }}>{l}</button>
        ))}
      </div>

      {subTab === 'postings' && (
        <div className="fade-up">
          <PostForm onPosted={loadPostings} />
          <div style={{ fontSize: 13, color: 'var(--muted)', margin: '18px 0 10px', fontWeight: 600 }}>
            My postings {postings ? `(${postings.length})` : ''}
          </div>
          {postings === null && <div className="loading-row"><span className="spin" /> Loading postings…</div>}
          {postings && postings.length === 0 && <EmptyState text="You haven't posted any internships yet." />}
          {postings?.map((p, i) => {
            const open = applicantsFor?.id === p.id;
            return (
              <div key={p.id}>
                <div className="fade-up hover-lift" style={{
                  ...cardBase, marginBottom: 12, animationDelay: `${i * 0.04}s`,
                  borderColor: open ? 'var(--amber)' : 'var(--line)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: 'var(--amber)', fontWeight: 600 }}>{(p.domain || 'General').toUpperCase()} · {p.status}</div>
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, marginTop: 6 }}>{p.title}</div>
                    </div>
                    {p.stipend ? <div style={{ background: 'var(--amber-soft)', color: 'var(--amber)', fontSize: 12, padding: '5px 10px', borderRadius: 999 }}>₹{p.stipend}/mo</div> : null}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>{p.location || 'Remote'} · {p.durationInMonths || '-'} months</div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                    <Primary onClick={() => (open ? closeApplicants() : viewApplicants(p))}>
                      {open ? 'Hide applicants' : 'View applicants'}
                    </Primary>
                  </div>
                </div>

                {open && (
                  <div ref={applicantsRef} data-applicants className="fade-up" style={{
                    margin: '4px 0 22px', paddingLeft: 16, borderLeft: '2px solid var(--amber)', scrollMarginTop: 90,
                  }}>
                    <div style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 12px', fontWeight: 600 }}>
                      Applicants{applicants ? ` (${applicants.length})` : ''} — {p.title}
                    </div>
                    {applicants && applicants.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                        {summary.map(([label, n]) => (
                          <span key={label} style={{
                            fontSize: 11.5, padding: '4px 10px', borderRadius: 999, border: '1px solid var(--line)',
                            color: n ? 'var(--text)' : 'var(--muted)', background: n ? 'var(--amber-soft)' : 'transparent',
                          }}>{`${label}: ${n}`}</span>
                        ))}
                      </div>
                    )}
                    {applicants === null && <div className="loading-row"><span className="spin" /> Loading applicants…</div>}
                    {applicants && applicants.length === 0 && (
                      <EmptyState text="No applicants yet. When a student applies to this internship, they appear here." />
                    )}
                    {applicants?.map((a, idx) => (
                      <ApplicantCard
                        key={a.id} index={idx} app={a} student={students[a.studentId]}
                        interviews={interviews} certs={certs} busy={busyId === a.id}
                        actions={{
                          shortlist: () => setStatus(a, 'SHORTLISTED'),
                          reject: () => setStatus(a, 'REJECTED'),
                          select: () => setStatus(a, 'SELECTED'),
                          schedule: () => setScheduleFor(a),
                          complete: () => setCompleteFor({ app: a, interview: activeInterview(a.id, interviews) }),
                          cancel: () => cancelInterview(a, activeInterview(a.id, interviews)),
                          certificate: () => issueCertificate(a),
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'analytics' && <Analytics postings={postings || []} />}

      {scheduleFor && (
        <ScheduleModal
          applicant={scheduleFor}
          student={students[scheduleFor.studentId]}
          jobTitle={title}
          onDone={refresh}
          onClose={() => setScheduleFor(null)}
        />
      )}
      {completeFor && (
        <CompleteModal
          interview={completeFor.interview}
          student={students[completeFor.app.studentId]}
          jobTitle={title}
          onDone={refresh}
          onClose={() => setCompleteFor(null)}
        />
      )}
    </div>
  );
}

// One applicant: header, pipeline stepper, and only the buttons that are valid for the current stage
function ApplicantCard({ app, student, interviews, certs, busy, actions, index }) {
  const rejected = app.status === 'REJECTED';
  const stage = getStage(app, interviews, certs);
  const iv = activeInterview(app.id, interviews);
  const cert = certs.find((c) => c.studentId === app.studentId && c.internshipId === app.internshipId);

  let info = null;
  if (stage === 2 && iv) {
    const where = iv.meetingLink || iv.location;
    info = `📅 ${iv.mode} · ${new Date(iv.scheduledAt).toLocaleString()}${where ? ' · ' + where : ''}`;
  } else if (stage === 3 && iv) {
    info = `✅ Interview done${iv.rating ? ' · ' + '★'.repeat(iv.rating) + '☆'.repeat(5 - iv.rating) : ''}${iv.feedback ? ` · "${iv.feedback}"` : ''}`;
  } else if (stage === 5 && cert) {
    info = `🎓 ${cert.certificateNumber}`;
  }

  let buttons;
  if (rejected) buttons = <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Application rejected</span>;
  else if (stage === 0) buttons = (<><Primary disabled={busy} onClick={actions.shortlist}>Shortlist candidate</Primary><Ghost disabled={busy} danger onClick={actions.reject}>Reject</Ghost></>);
  else if (stage === 1) buttons = (<><Primary disabled={busy} onClick={actions.schedule}>📅 Schedule interview</Primary><Ghost disabled={busy} danger onClick={actions.reject}>Reject</Ghost></>);
  else if (stage === 2) buttons = (<><Primary disabled={busy} onClick={actions.complete}>✅ Mark interview done</Primary><Ghost disabled={busy} onClick={actions.cancel}>Cancel interview</Ghost></>);
  else if (stage === 3) buttons = (<><Primary disabled={busy} onClick={actions.select}>Select candidate</Primary><Ghost disabled={busy} danger onClick={actions.reject}>Reject</Ghost></>);
  else if (stage === 4) buttons = <Primary disabled={busy} onClick={actions.certificate}>🎓 Issue certificate</Primary>;
  else buttons = <span style={{ fontSize: 13, color: 'var(--ok)', fontWeight: 600 }}>Certificate issued ✓</span>;

  return (
    <div className="fade-up" style={{ ...cardBase, marginBottom: 12, animationDelay: `${index * 0.04}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600 }}>{student ? student.name : `Student #${app.studentId}`}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {student?.email}{student?.collegeName ? ` · ${student.collegeName}` : ''} · Applied {new Date(app.appliedAt).toLocaleDateString()}
          </div>
        </div>
        {busy && <span className="spin" />}
      </div>

      <Pipeline stage={stage} rejected={rejected} />

      {!rejected && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{COMPANY_HINT[stage]}</div>}
      {info && (
        <div style={{ marginTop: 12, fontSize: 12.5, padding: '9px 12px', borderRadius: 8, background: 'var(--ink)', border: '1px solid var(--line)' }}>{info}</div>
      )}

      <ResumeBlock app={app} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        {buttons}
      </div>
    </div>
  );
}

// The resume PDF and the cover note the student submitted with the application
function ResumeBlock({ app }) {
  const toast = useToast();
  const [opening, setOpening] = useState(false);

  async function open() {
    setOpening(true);
    try { await openPdf(`${API.INTERNSHIP}/api/applications/${app.id}/resume`, app.resumeFileName); }
    catch (e) { toast(e.message, 'err'); }
    finally { setOpening(false); }
  }

  return (
    <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--ink)', border: '1px solid var(--line)' }}>
      {app.resumeFileName ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12.5 }}>📄 <span style={{ fontWeight: 600 }}>{app.resumeFileName}</span></div>
          <button className="press-btn" disabled={opening} onClick={open} style={ghostBtn}>
            {opening ? 'Opening…' : 'View resume (PDF)'}
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>No resume attached (applied before resumes were required).</div>
      )}
      {app.coverNote && (
        <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>Cover note: </span>{app.coverNote}
        </div>
      )}
    </div>
  );
}

function Primary({ children, onClick, disabled }) {
  return (
    <button className="press-btn" disabled={disabled} onClick={onClick} style={{
      background: 'linear-gradient(135deg,var(--amber),var(--coral))', color: 'var(--ink)',
      border: 'none', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      opacity: disabled ? .55 : 1,
    }}>{children}</button>
  );
}

function Ghost({ children, onClick, disabled, danger }) {
  return (
    <button className="press-btn" disabled={disabled} onClick={onClick} style={{
      ...ghostBtn, color: danger ? 'var(--err)' : 'var(--amber)', opacity: disabled ? .55 : 1,
    }}>{children}</button>
  );
}

function PostForm({ onPosted }) {
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    if (!form.title || !form.durationInMonths) {
      setMsg({ type: 'err', text: 'Title and duration are required.' });
      return;
    }
    setLoading(true);
    try {
      await apiPost(`${API.INTERNSHIP}/api/internships`, {
        title: form.title, domain: form.domain, location: form.location, description: form.description,
        stipend: form.stipend ? Number(form.stipend) : null,
        durationInMonths: Number(form.durationInMonths),
        deadline: form.deadline || null,
        companyId: Number(localStorage.getItem('ip_companyId')),
      }, { auth: true });
      setMsg({ type: 'ok', text: 'Posted! It is now live for students.' });
      toast('Internship posted 🎉', 'ok');
      setForm({});
      document.querySelectorAll('#post-form input, #post-form textarea').forEach((el) => (el.value = ''));
      onPosted();
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
      toast(e.message, 'err');
    } finally { setLoading(false); }
  }

  return (
    <div id="post-form" style={{ ...cardBase, marginBottom: 26 }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600 }}>Post a new internship</div>
      <div style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6 }}>This will appear instantly on the student side</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
        <Field label="Title" onChange={set('title')} placeholder="Backend Developer Intern" />
        <Field label="Domain" onChange={set('domain')} placeholder="Backend" />
        <Field label="Location" onChange={set('location')} placeholder="Bangalore / Remote" />
        <Field label="Stipend (₹/month)" onChange={set('stipend')} placeholder="25000" type="number" />
        <Field label="Duration (months)" onChange={set('durationInMonths')} placeholder="3" type="number" />
        <Field label="Deadline" onChange={set('deadline')} type="date" />
      </div>
      <div style={{ marginTop: 14 }}>
        <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Description</label>
        <textarea onChange={set('description')} placeholder="What will the intern work on?" style={{
          width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)',
          padding: '12px 14px', borderRadius: 9, fontSize: 14, outline: 'none', minHeight: 70, resize: 'vertical',
        }} />
      </div>
      {msg && (
        <div style={{
          fontSize: 13, padding: '10px 12px', borderRadius: 8, margin: '16px 0 0',
          background: msg.type === 'ok' ? '#4FAE8E1a' : '#E8714F1a',
          color: msg.type === 'ok' ? 'var(--ok)' : 'var(--err)',
        }}>{msg.text}</div>
      )}
      <button className="press-btn" disabled={loading} onClick={submit} style={{
        maxWidth: 220, marginTop: 14, padding: 13, borderRadius: 9, border: 'none',
        background: 'linear-gradient(135deg,var(--amber),var(--coral))', color: 'var(--ink)',
        fontWeight: 600, fontSize: 14.5, opacity: loading ? .6 : 1,
      }}>{loading ? 'Posting…' : 'Post internship'}</button>
    </div>
  );
}

function Field({ label, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} placeholder={placeholder} onChange={onChange} style={{
        width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)',
        padding: '12px 14px', borderRadius: 9, fontSize: 14, outline: 'none',
      }} />
    </div>
  );
}

function Analytics({ postings }) {
  const [allApps, setAllApps] = useState(null);

  useEffect(() => {
    if (postings.length === 0) { setAllApps([]); return; }
    Promise.all(postings.map((p) =>
      apiGet(`${API.INTERNSHIP}/api/applications/internship/${p.id}`, { auth: true })
        .then((apps) => apps.map((a) => ({ ...a, _title: p.title })))
        .catch(() => [])
    )).then((res) => setAllApps(res.flat()));
  }, [postings]);

  const counts = useMemo(() => {
    const c = { APPLIED: 0, SHORTLISTED: 0, SELECTED: 0, REJECTED: 0 };
    (allApps || []).forEach((a) => { if (c[a.status] !== undefined) c[a.status]++; });
    return c;
  }, [allApps]);

  const rate = allApps && allApps.length ? Math.round(((counts.SHORTLISTED + counts.SELECTED) / allApps.length) * 100) : 0;

  if (allApps === null) return <div className="loading-row"><span className="spin" /> Loading analytics…</div>;

  return (
    <div className="fade-up">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 26 }} className="stat-grid">
        <StatCard num={postings.length} label="Total postings" />
        <StatCard num={allApps.length} label="Total applicants" />
        <StatCard num={`${rate}%`} label="Shortlist + select rate" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="chart-row">
        <div style={cardBase}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Applicant status breakdown</div>
          <div style={{ position: 'relative', height: 260 }}><Doughnut data={{
            labels: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
            datasets: [{ data: [counts.APPLIED, counts.SHORTLISTED, counts.SELECTED, counts.REJECTED],
              backgroundColor: ['#F2A341', '#4FAE8E', '#2E8B6F', '#E8714F'], borderColor: '#201D19', borderWidth: 2 }],
          }} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9C958A' } } }, cutout: '65%' }} /></div>
        </div>
        <div style={cardBase}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Applicants per posting</div>
          <div style={{ position: 'relative', height: 260 }}><Bar data={{
            labels: postings.map((p) => (p.title.length > 16 ? p.title.slice(0, 16) + '…' : p.title)),
            datasets: [{ data: postings.map((p) => allApps.filter((a) => a._title === p.title).length), backgroundColor: '#F2A341', borderRadius: 6, maxBarThickness: 36 }],
          }} options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#9C958A' }, grid: { display: false } },
              y: { ticks: { color: '#9C958A', stepSize: 1 }, grid: { color: '#38332C' }, beginAtZero: true },
            },
          }} /></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ num, label }) {
  return (
    <div style={cardBase}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 600, color: 'var(--amber)' }}>{num}</div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const ghostBtn = {
  background: 'transparent', border: '1px solid var(--line)', color: 'var(--amber)',
  padding: '7px 12px', borderRadius: 7, fontSize: 12.5,
};
