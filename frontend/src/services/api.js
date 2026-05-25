const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function generateContent(payload) {
  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data.data;
}
