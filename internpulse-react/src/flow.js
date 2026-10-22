// The application pipeline, in order. Both dashboards derive their UI from this.
//
//   0 Applied      -> student applied
//   1 Shortlisted  -> company shortlisted the candidate
//   2 Interview    -> interview scheduled (interview-service)
//   3 Evaluated    -> interview marked done with rating + feedback
//   4 Selected     -> company selected the candidate
//   5 Certificate  -> certificate issued (certificate-service)
//
// Rejected is a separate dead-end state (stage -1).

export const STEPS = ['Applied', 'Shortlisted', 'Interview', 'Evaluated', 'Selected', 'Certificate'];

// The latest interview for an application that has not been cancelled
export function activeInterview(applicationId, interviews) {
  return interviews
    .filter((i) => i.applicationId === applicationId && i.status !== 'CANCELLED')
    .sort((a, b) => b.id - a.id)[0];
}

export function getStage(app, interviews, certs) {
  if (app.status === 'REJECTED') return -1;
  if (certs.some((c) => c.studentId === app.studentId && c.internshipId === app.internshipId)) return 5;
  if (app.status === 'SELECTED') return 4;
  if (app.status === 'SHORTLISTED') {
    const iv = activeInterview(app.id, interviews);
    if (iv && iv.status === 'COMPLETED') return 3;
    if (iv && iv.status === 'SCHEDULED') return 2;
    return 1;
  }
  return 0;
}

export const COMPANY_HINT = [
  'Review the candidate, then shortlist or reject.',
  'Next step: schedule an interview.',
  'After the interview, mark it as done with a rating.',
  'Interview evaluated — select or reject the candidate.',
  'Last step: issue the internship certificate.',
  'All done — certificate issued.',
];

export const STUDENT_HINT = [
  'Waiting for the company to review your application.',
  "You're shortlisted — an interview will be scheduled soon.",
  'Interview scheduled — details are in the Interviews tab.',
  'Interview done — waiting for the final decision.',
  "You're selected! The company will issue your certificate.",
  'Certificate issued — see the Certificates tab.',
];
