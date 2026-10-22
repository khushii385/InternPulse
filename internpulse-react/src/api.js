export const API = {
  STUDENT: 'http://localhost:8080',
  COMPANY: 'http://localhost:8081',
  INTERNSHIP: 'http://localhost:8082',
  INTERVIEW: 'http://localhost:8083',
  NOTIFICATION: 'http://localhost:8084',
  CERTIFICATE: 'http://localhost:8085',
};

function authHeaders() {
  const token = localStorage.getItem('ip_token');
  return token ? { Authorization: 'Bearer ' + token } : {};
}

// Turns the backend's error shape into one readable message
function errorMessage(body, status) {
  if (body && body.fieldErrors) {
    const joined = Object.values(body.fieldErrors).join(', ');
    if (joined) return joined;
  }
  if (body && body.message) return body.message;
  if (status === 401 || status === 403) {
    return `Access denied (${status}) - the server blocked this request. If you are registering, the service's SecurityConfig must allow this endpoint.`;
  }
  return `Request failed (${status})`;
}

// fetch() throws (instead of returning a status) when the server is down or CORS blocks the call
async function doFetch(url, init) {
  try {
    return await fetch(url, init);
  } catch (e) {
    throw new Error('Cannot reach the server. Check that the service is running and that CORS is enabled for it.');
  }
}

export async function apiGet(url, { auth = true } = {}) {
  const res = await doFetch(url, { headers: auth ? authHeaders() : {} });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(errorMessage(body, res.status));
  }
  return res.json();
}

export async function apiSend(url, method, data, { auth = true } = {}) {
  const res = await doFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth ? authHeaders() : {}) },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(errorMessage(body, res.status));
  return body;
}

export const apiPost = (url, data, opts) => apiSend(url, 'POST', data, opts);
export const apiPatch = (url, data, opts) => apiSend(url, 'PATCH', data, opts);

// Sends a notification through notification-service (shows up in the student's bell).
// Never throws — a failed notification should not break the main action.
export async function notify(email, subject, message, type = 'GENERAL') {
  if (!email) return;
  try {
    await apiPost(`${API.NOTIFICATION}/api/notifications`, { recipientEmail: email, subject, message, type }, { auth: true });
  } catch (e) { /* non-fatal */ }
}

// multipart/form-data upload. Do NOT set Content-Type yourself - the browser adds the boundary.
export async function apiUpload(url, formData, { auth = true } = {}) {
  const res = await doFetch(url, { method: 'POST', headers: auth ? authHeaders() : {}, body: formData });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(errorMessage(body, res.status));
  return body;
}

// Opens a protected PDF in a new tab. A plain <a href> cannot send the JWT, so we fetch it first.
export async function openPdf(url, fileName = 'resume.pdf') {
  const popup = window.open('', '_blank'); // opened right away so the browser does not block it
  try {
    const res = await doFetch(url, { headers: authHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(errorMessage(body, res.status));
    }
    const pdf = new Blob([await res.blob()], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(pdf);
    if (popup) {
      popup.location.href = objectUrl;
    } else {
      const a = document.createElement('a'); // popup blocked: download instead
      a.href = objectUrl; a.download = fileName; a.click();
    }
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (e) {
    if (popup) popup.close();
    throw e;
  }
}
