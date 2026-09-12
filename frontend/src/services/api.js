const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

async function request(path, options = {}, getToken) {
  if (!API_URL) {
    throw new Error('VITE_API_URL is missing. Set it to your deployed FastAPI URL ending in /api.');
  }
  const token = getToken ? await getToken() : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.detail?.message || body.detail || 'The request failed');
    error.status = response.status;
    error.payload = body.detail;
    throw error;
  }
  return body;
}

export const api = {
  getMe: (getToken) => request('/me', {}, getToken),
  updateMe: (payload, getToken) => request('/me', { method: 'PATCH', body: JSON.stringify(payload) }, getToken),
  getQuests: (getToken) => request('/quests', {}, getToken),
  createQuest: (payload, getToken) => request('/quests', { method: 'POST', body: JSON.stringify(payload) }, getToken),
  startQuest: (id, getToken) => request(`/quests/${id}/start`, { method: 'POST' }, getToken),
  completeQuest: (id, getToken) => request(`/quests/${id}/complete`, { method: 'POST' }, getToken),
  getLeaderboard: (getToken) => request('/leaderboard', {}, getToken),
  getShop: (getToken) => request('/shop', {}, getToken),
  purchase: (id, getToken) => request(`/shop/${id}/purchase`, { method: 'POST' }, getToken),
};
