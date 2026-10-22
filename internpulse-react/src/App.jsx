import React, { useState } from 'react';
import { ToastProvider } from './components/Toast.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import CompanyDashboard from './pages/CompanyDashboard.jsx';

function getStoredSession() {
  const token = localStorage.getItem('ip_token');
  const email = localStorage.getItem('ip_email');
  const role = localStorage.getItem('ip_role');
  return token && email && role ? { token, email, role } : null;
}

export default function App() {
  const [session, setSession] = useState(getStoredSession());
  // Skip the landing screen entirely if the user already has an active session
  const [screen, setScreen] = useState(getStoredSession() ? 'app' : 'landing');

  function handleLogout() {
    localStorage.removeItem('ip_token');
    localStorage.removeItem('ip_role');
    localStorage.removeItem('ip_email');
    localStorage.removeItem('ip_studentId');
    localStorage.removeItem('ip_companyId');
    setSession(null);
    setScreen('landing');
  }

  function handleLogin(data) {
    setSession(data);
    setScreen('app');
  }

  return (
    <ToastProvider>
      {screen === 'landing' && <Landing onEnter={() => setScreen('auth')} />}
      {screen === 'auth' && <Auth onLogin={handleLogin} />}
      {screen === 'app' && session && session.role === 'STUDENT' && <StudentDashboard session={session} onLogout={handleLogout} />}
      {screen === 'app' && session && session.role === 'COMPANY' && <CompanyDashboard session={session} onLogout={handleLogout} />}
    </ToastProvider>
  );
}
