import React, { useEffect, useMemo, useState } from 'react';
import { API, apiGet, openPdf } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import SkeletonGrid from '../components/Skeleton.jsx';
import ApplyModal from '../components/ApplyModal.jsx';
import Topbar from '../components/Topbar.jsx';
import Pipeline from '../components/Pipeline.jsx';
import { getStage, STUDENT_HINT } from '../flow.js';

export default function StudentDashboard({ session, onLogout }) {
  const [tab, setTab] = useState('jobs');
  const [jobs, setJobs] = useState(null);
  const [companies, setCompanies] = useState({});
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState('');
  const [modalJob, setModalJob] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { loadAll(); }, []);
  // Company actions happen elsewhere, so re-fetch whenever the student opens a status tab
  useEffect(() => { if (tab !== 'jobs') loadAll(); }, [tab]);

  async function loadAll() {
    try {
      const [jobsData, companiesData, students] = await Promise.all([
        apiGet(`${API.INTERNSHIP}/api/internships`, { auth: true }),
        apiGet(`${API.COMPANY}/api/companies`, { auth: true }).catch(() => []),
        apiGet(`${API.STUDENT}/api/students`, { auth: false }).catch(() => []),
      ]);
      setJobs(jobsData);
      setCompanies(Object.fromEntries(companiesData.map((c) => [c.id, c])));

      const me = students.find((s) => s.email === session.email);
      if (me) {
        localStorage.setItem('ip_studentId', me.id);
        window.__meStudent = me;
        const apps = await apiGet(`${API.INTERNSHIP}/api/applications/student/${me.id}`, { auth: true }).catch(() => []);
        setApplications(apps);

        const [ivLists, certList] = await Promise.all([
          Promise.all(apps.map((a) =>
            apiGet(`${API.INTERVIEW}/api/interviews/application/${a.id}`, { auth: true }).catch(() => [])
          )),
          apiGet(`${API.CERTIFICATE}/api/certificates/student/${me.id}`, { auth: true }).catch(() => []),
        ]);
        setInterviews(ivLists.flat());
        setCerts(certList);
      }
    } catch (e) { /* handled per-section */ }

    apiGet(`${API.NOTIFICATION}/api/notifications/email/${encodeURIComponent(session.email)}`, { auth: true })
      .then(setNotifications).catch(() => {});
  }

  const appliedIds = useMemo(() => new Set(applications.map((a) => a.internshipId)), [applications]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    const q = search.toLowerCase().trim();
    if (!q) return jobs;
    return jobs.filter((j) =>
      (j.domain || '').toLowerCase().includes(q) ||
      (j.title || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q) ||
      (companies[j.companyId]?.name || '').toLowerCase().includes(q)
    );
  }, [jobs, search, companies]);

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      <Topbar
        session={session}
        onLogout={onLogout}
        notifications={notifications}
        tabs={[
          ['jobs', 'Internships'],
          ['apps', 'My Applications'],
          ['interviews', 'Interviews'],
          ['certs', 'Certificates'],
        ]}
        active={tab}
        onTabChange={setTab}
      />

      {tab === 'jobs' && (
        <div className="fade-up">
          <Header title="Open internships" sub="Connects to Internship Service (localhost:8082)" />
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by domain, title or company..."
              style={inputStyle}
            />
            <div style={{ fontSize: 12.5, color: 'var(--amber)', whiteSpace: 'nowrap', alignSelf: 'center' }}>
              {jobs ? `${filteredJobs.length} open internship${filteredJobs.length === 1 ? '' : 's'}` : ''}
            </div>
          </div>

          {!jobs && <SkeletonGrid />}
          {jobs && filteredJobs.length === 0 && <EmptyState text="No internships match your search." />}
          {jobs && filteredJobs.length > 0 && (
            <div className="job-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {filteredJobs.map((j, i) => (
                <JobCard
                  key={j.id} job={j} company={companies[j.companyId]} index={i}
                  applied={appliedIds.has(j.id)}
                  onApply={() => setModalJob(j)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'apps' && (
        <div className="fade-up">
          <Header title="My applications" sub="Follow every application from applied to certificate" />
          {applications.length === 0 && <EmptyState text="You haven't applied to anything yet." />}
          {applications.map((a, i) => {
            const job = jobs?.find((j) => j.id === a.internshipId);
            const stage = getStage(a, interviews, certs);
            const rejected = a.status === 'REJECTED';
            return (
              <div key={a.id} className="fade-up hover-lift" style={{ ...cardBase, marginBottom: 14, animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16.5, fontWeight: 600 }}>
                      {job ? job.title : `Internship #${a.internshipId}`}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
                      {companies[job?.companyId]?.name || ''} · Applied {new Date(a.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <StatusPill status={a.status} />
                </div>
                <Pipeline stage={stage} rejected={rejected} />
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>
                  {rejected ? 'This application was not selected this time.' : STUDENT_HINT[stage]}
                </div>
                {a.resumeFileName && <ResumeLink app={a} />}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'interviews' && (
        <div className="fade-up">
          <Header title="Interviews" sub="Connects to Interview Service (localhost:8083)" />
          {interviews.length === 0 && (
            <EmptyState text="No interviews yet. Once a company shortlists you and schedules one, it shows up here." />
          )}
          {interviews.map((iv, i) => {
            const app = applications.find((a) => a.id === iv.applicationId);
            const job = jobs?.find((j) => j.id === app?.internshipId);
            const where = iv.meetingLink || iv.location;
            return (
              <Row key={iv.id} index={i}
                title={job ? job.title : 'Interview'}
                meta={`${iv.mode} · ${new Date(iv.scheduledAt).toLocaleString()}${where ? ' · ' + where : ''}${iv.rating ? ' · Rated ' + iv.rating + '/5' : ''}`}
                right={<StatusPill status={iv.status === 'SCHEDULED' ? 'APPLIED' : iv.status === 'COMPLETED' ? 'SELECTED' : 'REJECTED'} label={iv.status} />}
              />
            );
          })}
        </div>
      )}

      {tab === 'certs' && (
        <div className="fade-up">
          <Header title="Certificates" sub="Connects to Certificate Service (localhost:8085)" />
          {certs.length === 0 && <EmptyState text="No certificates yet — they appear once a company issues one after selecting you." />}
          {certs.map((c, i) => (
            <div key={c.id} className="fade-up hover-lift" style={{ ...cardBase, marginBottom: 12, animationDelay: `${i * 0.04}s` }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>{c.certificateNumber}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, marginTop: 6 }}>{c.internshipTitle}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
                {c.companyName} · {c.durationInMonths} months · Issued {c.issueDate}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalJob && (
        <ApplyModal
          job={modalJob}
          companyName={companies[modalJob.companyId]?.name || `Company #${modalJob.companyId}`}
          onClose={() => setModalJob(null)}
          onApplied={loadAll}
        />
      )}
    </div>
  );
}

function ResumeLink({ app }) {
  const toast = useToast();
  async function open() {
    try { await openPdf(`${API.INTERNSHIP}/api/applications/${app.id}/resume`, app.resumeFileName); }
    catch (e) { toast(e.message, 'err'); }
  }
  return (
    <button onClick={open} style={{ background: 'transparent', border: 'none', color: 'var(--amber)', fontSize: 12.5, padding: 0, marginTop: 10 }}>
      📄 {app.resumeFileName} - view
    </button>
  );
}

function JobCard({ job, company, applied, onApply, index }) {
  const companyName = company?.name || `Company #${job.companyId}`;
  return (
    <div className="fade-up hover-lift" style={{ ...cardBase, animationDelay: `${index * 0.04}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11.5, color: 'var(--amber)', fontWeight: 600 }}>{(job.domain || 'General').toUpperCase()}</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, marginTop: 6 }}>{job.title}</div>
          {company?.website ? (
            <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, marginTop: 3, display: 'block', color: 'var(--text)', textDecoration: 'none' }}>
              {companyName} ↗
            </a>
          ) : <div style={{ fontSize: 12.5, marginTop: 3, color: 'var(--text)' }}>{companyName}</div>}
        </div>
        {job.stipend ? <div style={pillStyle}>₹{job.stipend}/mo</div> : null}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>{job.location || 'Remote'} · {job.durationInMonths || '-'} months</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, lineHeight: 1.5 }}>{job.description || 'No description provided.'}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{companyName}</div>
        <button
          className="press-btn" disabled={applied} onClick={onApply}
          style={{
            background: applied ? 'var(--ok)' : 'linear-gradient(135deg,var(--amber),var(--coral))',
            color: 'var(--ink)', border: 'none', padding: '9px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, opacity: applied ? .7 : 1,
          }}
        >
          {applied ? '✓ Applied' : 'Apply'}
        </button>
      </div>
    </div>
  );
}

export function Row({ title, meta, right, index = 0 }) {
  return (
    <div className="fade-up hover-lift" style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12,
      flexWrap: 'wrap', animationDelay: `${index * 0.04}s`,
    }}>
      <div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15.5, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{meta}</div>
      </div>
      {right}
    </div>
  );
}

export function StatusPill({ status, label }) {
  const colors = {
    APPLIED: ['#F2A34122', 'var(--amber)'],
    SHORTLISTED: ['#4FAE8E22', 'var(--ok)'],
    SELECTED: ['#4FAE8E33', 'var(--ok)'],
    REJECTED: ['#E8714F22', 'var(--err)'],
  };
  const [bg, color] = colors[status] || colors.APPLIED;
  return (
    <div style={{ fontSize: 11.5, padding: '5px 11px', borderRadius: 999, fontWeight: 600, background: bg, color, whiteSpace: 'nowrap' }}>
      {label || status}
    </div>
  );
}

export function Header({ title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600 }}>{title}</div>
      <div style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

export function EmptyState({ text }) {
  return <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }} className="fade-in">{text}</div>;
}

export const cardBase = { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 20 };
const pillStyle = { background: 'var(--amber-soft)', color: 'var(--amber)', fontSize: 12, padding: '5px 10px', borderRadius: 999, whiteSpace: 'nowrap' };
const inputStyle = {
  flex: 1, background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--text)',
  padding: '12px 14px', borderRadius: 9, fontSize: 14, outline: 'none',
};
