const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_BASE_URL = BASE_URL;

// Fire-and-forget health ping. Called once on app load so a cold-started
// backend (e.g. Render free tier) begins waking while the user is still on
// the landing/login screen — cutting perceived auth latency on first request.
export function warmup() {
  try {
    fetch(`${BASE_URL}/health`, { method: 'GET', cache: 'no-store', keepalive: true }).catch(() => {});
  } catch {
    // ignore — warm-up is best-effort only
  }
}

function authHeaders() {
  const token = localStorage.getItem('careeros_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Single source of truth for every request: attaches nothing extra beyond the
// given fetchOptions, but centralizes 401 handling (session expiry) and safe
// JSON parsing so a non-JSON body (HTML 500, empty 204, cold-start 502) can't
// throw a SyntaxError over the real error.
async function core(path, fetchOptions, fallbackMessage = 'Request failed.') {
  const response = await fetch(`${BASE_URL}${path}`, fetchOptions);

  if (response.status === 401) {
    localStorage.removeItem('careeros_token');
    window.dispatchEvent(new Event('careeros:auth-expired'));
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || fallbackMessage);
  }
  return data.data;
}

const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...authHeaders() });

export async function generateContent(payload) {
  return core('/api/generate', { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) }, 'Something went wrong. Please try again.');
}

export async function matchJob(payload) {
  return core('/api/match', { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) }, 'Something went wrong. Please try again.');
}

async function post(path, payload) {
  return core(path, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) });
}

async function request(path, options = {}) {
  return core(path, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
}

async function upload(path, formData) {
  return core(path, { method: 'POST', headers: { ...authHeaders() }, body: formData });
}

export const careerApi = {
  analyze: (payload) => post('/api/career/analyze', payload),
};

export const jobAnalyzerApi = {
  analyze: (payload) => post('/api/job/analyze', payload),
};

export const interviewApi = {
  start: (payload) => post('/api/interview/start', payload),
  answer: (payload) => post('/api/interview/answer', payload),
  end: (payload) => post('/api/interview/end', payload),
  history: () => request('/api/interview/history'),
  detail: (id) => request(`/api/interview/${id}`),
};

export const roadmapApi = {
  create: (payload) => post('/api/roadmap/create', payload),
};

export const applicationsApi = {
  list: () => request('/api/applications'),
  create: (payload) => post('/api/applications', payload),
  update: (id, payload) => request(`/api/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  remove: (id) => request(`/api/applications/${id}`, { method: 'DELETE' }),
  followUp: (id) => post(`/api/applications/${id}/follow-up`, {}),
};

export const contentApi = {
  list: () => request('/api/content/library'),
  remove: (id) => request(`/api/content/${id}`, { method: 'DELETE' }),
};

export const authApi = {
  signup: (payload) => post('/api/auth/signup', payload),
  login: (payload) => post('/api/auth/login', payload),
  guestLogin: () => post('/api/auth/guest', {}),
  me: () => request('/api/auth/me'),
  logout: () => post('/api/auth/logout', {}),
};

export const profileApi = {
  get: () => request('/api/user/profile'),
  update: (payload) => request('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
};

export const voiceInterviewApi = {
  start: (payload) => post('/api/voice-interview/start', payload),
  answer: (payload) => post('/api/voice-interview/answer', payload),
  end: (payload) => post('/api/voice-interview/end', payload),
  history: () => request('/api/voice-interview/history'),
  detail: (id) => request(`/api/voice-interview/${id}`),
};

export const dashboardApi = {
  stats: () => request('/api/dashboard/stats'),
};

export const intelligenceApi = {
  overview: () => request('/api/intelligence/overview'),
  inspectJob: (payload) => post('/api/intelligence/inspect-job', payload),
};

export const careerVaultApi = {
  search: (query = '') => request(`/api/career-vault/search?q=${encodeURIComponent(query)}`),
};

export const resumeApi = {
  parse: ({ file, text }) => {
    const formData = new FormData();
    if (file) formData.append('resume', file);
    if (text) formData.append('text', text);
    return upload('/api/resume/parse', formData);
  },
  applyParsed: (payload) => post('/api/resume/apply-parsed', payload),
  versions: () => request('/api/resume/versions'),
  saveVersion: (payload) => post('/api/resume/versions', payload),
  diff: (payload) => post('/api/resume/diff', payload),
};

export const adminApi = {
  stats: () => request('/api/admin/stats'),
};
