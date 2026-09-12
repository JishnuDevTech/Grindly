const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

async function request(path, options = {}, getToken) {
  if (!API_URL) {
    throw new Error('VITE_API_URL is missing. Set it to your deployed FastAPI URL ending in /api.');
  }
  const token = getToken ? await getToken() : null;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(`Could not reach the Grindly API at ${API_URL}. Check Render CORS and backend status.`);
  }
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
  deleteAccount: (getToken) => request('/account', { method: 'DELETE' }, getToken),
  getQuests: (getToken) => request('/quests', {}, getToken),
  createQuest: (payload, getToken) => request('/quests', { method: 'POST', body: JSON.stringify(payload) }, getToken),
  startQuest: (id, getToken) => request(`/quests/${id}/start`, { method: 'POST' }, getToken),
  completeQuest: (id, getToken) => request(`/quests/${id}/complete`, { method: 'POST' }, getToken),
  getLeaderboard: (getToken) => request('/leaderboard', {}, getToken),
  getShop: (getToken) => request('/shop', {}, getToken),
  purchase: (id, getToken) => request(`/shop/${id}/purchase`, { method: 'POST' }, getToken),
  getFriends: (getToken) => request('/friends', {}, getToken),
  searchFriends: (query, getToken) => request(`/friends/search?q=${encodeURIComponent(query)}`, {}, getToken),
  getFriendRequests: (getToken) => request('/friends/requests', {}, getToken),
  sendFriendRequest: (userId, getToken) => request('/friends/requests', { method: 'POST', body: JSON.stringify({ userId }) }, getToken),
  acceptFriendRequest: (requestId, getToken) => request(`/friends/requests/${requestId}/accept`, { method: 'POST' }, getToken),
  rejectFriendRequest: (requestId, getToken) => request(`/friends/requests/${requestId}/reject`, { method: 'POST' }, getToken),
  removeFriend: (friendId, getToken) => request(`/friends/${friendId}`, { method: 'DELETE' }, getToken),
  getFriendLeaderboard: (getToken) => request('/friends/leaderboard', {}, getToken),
  getPublicProfile: (username, getToken) => request(`/users/${encodeURIComponent(username)}/profile`, {}, getToken),
  getNotifications: (getToken) => request('/notifications', {}, getToken),
  markNotificationRead: (id, getToken) => request(`/notifications/${id}/read`, { method: 'POST' }, getToken),
  markAllNotificationsRead: (getToken) => request('/notifications/read-all', { method: 'POST' }, getToken),
  getPreferences: (getToken) => request('/preferences', {}, getToken),
  updatePreferences: (values, getToken) => request('/preferences', { method: 'PATCH', body: JSON.stringify({ values }) }, getToken),
  getInventory: (getToken) => request('/inventory', {}, getToken),
  equipItem: (id, getToken) => request(`/inventory/${encodeURIComponent(id)}/equip`, { method: 'POST' }, getToken),
  unequipItem: (id, getToken) => request(`/inventory/${encodeURIComponent(id)}/unequip`, { method: 'POST' }, getToken),
  getAIContext: (getToken) => request('/ai/context', {}, getToken),
  runAIAction: (action, input, getToken) => request('/ai/actions', { method: 'POST', body: JSON.stringify({ action, input }) }, getToken),
};
