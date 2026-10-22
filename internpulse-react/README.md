# InternPulse — React Frontend

A React + Vite frontend for the InternPulse microservices backend (6 Spring Boot services).

## Setup

1. **Install Node.js** (if not already installed): https://nodejs.org (LTS version)
2. Extract this folder anywhere (e.g. next to your `InternPulse` backend folder)
3. Open a terminal in this folder and run:
   ```
   npm install
   ```
4. Start the dev server:
   ```
   npm run dev
   ```
5. Open the URL it prints (usually `http://localhost:5173`)

## Before running

Make sure your 6 backend services are running on their usual ports:
- student-service → 8080
- company-service → 8081
- internship-service → 8082
- interview-service → 8083
- notification-service → 8084
- certificate-service → 8085

## Project structure

```
src/
├── api.js                    # API base URLs + fetch helpers
├── flow.js                   # Pipeline stages + hints
├── resume.js                 # PDF checks used by the apply form
├── App.jsx                   # Auth routing (login vs dashboards)
├── styles.css                # Theme variables + animations
├── components/
│   ├── Toast.jsx              # Toast notification system
│   ├── Skeleton.jsx           # Loading skeleton
│   ├── Modal.jsx              # Reusable modal wrapper
│   ├── ApplyModal.jsx         # Student: apply form (PDF resume upload + note)
│   ├── ScheduleModal.jsx      # Company: schedule an interview
│   ├── CompleteModal.jsx      # Company: mark interview done (rating + feedback)
│   ├── Pipeline.jsx           # Applied → Certificate progress stepper
│   └── Topbar.jsx             # Sticky header with tabs/bell/logout
└── pages/
    ├── Landing.jsx              # Animated intro screen (word-by-word headline), "Get started" → Auth
    ├── Auth.jsx                 # Login / Register (Student + Company)
    ├── StudentDashboard.jsx    # Internships, Applications, Interviews, Certificates
    └── CompanyDashboard.jsx    # Post internships, applicants, analytics charts
```

## Flow

`Landing` (animated intro) → `Auth` (login/register) → `StudentDashboard` or `CompanyDashboard`.

If a session already exists in localStorage (you're still logged in from before), the app skips the landing screen and opens straight into the dashboard.

## The application pipeline

Every application moves through six stages. The company only sees the button that is valid for the current stage.

| Stage | Who acts | What happens | Service |
|---|---|---|---|
| 1. Applied | Student | Apply with the form | internship-service |
| 2. Shortlisted | Company | "Shortlist candidate" | internship-service |
| 3. Interview | Company | "Schedule interview" (date, online link / location) | interview-service |
| 4. Evaluated | Company | "Mark interview done" (rating + feedback) | interview-service |
| 5. Selected | Company | "Select candidate" | internship-service |
| 6. Certificate | Company | "Issue certificate" | certificate-service |

Every step also sends a notification to the student's bell (notification-service).
Stage logic lives in `src/flow.js`; the stepper UI is `src/components/Pipeline.jsx`.

## Resume upload (needs the backend patch)

Applying now requires a **PDF resume** (max 2 MB) and takes an optional cover note.
The form checks the extension, the size and the real `%PDF-` file signature, and the backend repeats the same checks.
The company sees the cover note and a **View resume (PDF)** button for every applicant.

This needs `internship-service-resume-patch.zip` applied to internship-service first (see its README.txt).

## Company dashboard

- **View applicants** opens the list directly under the posting you clicked (and scrolls to it). Click again to hide.
- Chips above the list show how many applicants are in each stage.
- Each applicant card shows the pipeline and only the next valid action.

## Notes

- Session (JWT token) is stored in `localStorage`, so refreshing the page keeps you logged in.
- All animations (fade-up, hover-lift, skeleton shimmer, toast) are plain CSS — no extra animation library needed.
- Charts use `chart.js` + `react-chartjs-2` (already in package.json).
- CORS must be enabled on all 6 backend services (should already be done from earlier setup).

## Building for production

```
npm run build
```
Output goes to `dist/` — can be deployed to Netlify, Vercel, or any static host.
