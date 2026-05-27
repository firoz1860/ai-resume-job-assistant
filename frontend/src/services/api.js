const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('careeros_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function generateContent(payload) {
  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data.data;
}

export async function matchJob(payload) {
  const response = await fetch(`${BASE_URL}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data.data;
}

async function post(path, payload) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Request failed.');
  return data.data;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
  const data = await response.json();
  if (response.status === 401) {
    localStorage.removeItem('careeros_token');
    window.dispatchEvent(new Event('careeros:auth-expired'));
  }
  if (!response.ok || !data.success) throw new Error(data.error || 'Request failed.');
  return data.data;
}

async function upload(path, formData) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Upload failed.');
  return data.data;
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
